import { validateAgainst } from "@zakahacecosas/string-utils";
import { FILENAMES, SRCSET, normalizer } from "../constants";
import { parseKps } from "./manifest";
import type { GRA_RELEASE } from "../types/github";
import type { KONBINI_MANIFEST, KONBINI_PKG_SCOPE } from "../types/manifest";
import { parse } from "yaml";
import type { AUTHOR } from "../types/author";
import { downloadHandler } from "../toolkit/install";
import { join } from "path";
import { fetchAPI } from "./fetch";
import { KbiSecGPG } from "../security/gpg";
import { existsSync } from "fs";

/**
 * Konbini Programming Interface (Konbini API, or KPI).
 *
 * @export
 * @namespace KPI
 */
export namespace KPI {
    /**
     * Given a package name, returns the root of its KPI SOURCE route.
     *
     * @param {string} pkg Package name.
     * @example
     * ```ts
     * // imagine the KonbiniPkgs root URL is "konbini.sample/pkgs/"
     * KPI.locateUsr("Konbini");
     * // returns "https://konbini.samle/pkgs/ko"
     * ```
     * @returns {string} String URL.
     */
    export function locatePkg(pkg: string): string {
        // get the two 1st letters to locate its directory
        return [SRCSET.PKGs, normalizer(pkg).slice(0, 2)].join("/");
    }
    /**
     * Given a user / org name, returns the root of its KPI SOURCE route.
     *
     * @param {string} usr User / org name.
     * @example
     * ```ts
     * // imagine the AuthorsRegistry root URL is "konbini.sample/authors/"
     * KPI.locateUsr("org.Hana");
     * // returns "https://konbini.samle/authors/org/ha"
     * ```
     * @returns {string} String URL.
     */
    export function locateUsr(usr: string): string {
        // split scope
        const scopes = normalizer(usr).split(".");
        if (scopes.length !== 2) throw `Invalid author ID length (${scopes.length} && ${scopes})`;
        if (!validateAgainst(scopes[0], ["usr", "org"]))
            throw `Invalid author ID prefix (${scopes})`;
        // get the two 1st letters to locate its directory
        const prefix = normalizer(usr).split(".")[1]!.slice(0, 2);
        return [SRCSET.USRs, scopes[0], prefix].join("/");
    }
    /**
     * Fetches the manifest of the given package, if it exists.
     *
     * @async
     * @param {string} packageName
     * @returns {string}
     */
    export async function manifest(packageName: string): Promise<KONBINI_MANIFEST> {
        const manifestPath = [locatePkg(packageName), `${normalizer(packageName)}.yaml`].join("/");
        const response = await fetchAPI(manifestPath, "GET");

        if (response.status === 404)
            throw `Package ${packageName} does NOT exist. Perhaps you misspelled it.`;
        if (!response.ok)
            throw `Could not access KPI remote for ${packageName} (HTTP:${response.status}).`;

        const packageData = await response.text();
        const packageInfo = parse(packageData);
        return packageInfo;
    }
    /** Given a package manifest and the desired KPS, returns the absolute URL to its downloadable file. */
    export async function pkgRemotes(
        kps: KONBINI_PKG_SCOPE,
        manifest: KONBINI_MANIFEST,
    ): Promise<{
        coreAsset: string;
        pkgVersion: string;
        shaAsset: string;
        ascAsset: string;
    }> {
        const kv = parseKps(kps);
        if (kv.src !== "std")
            throw `KPI attempt to fetch remotes for a non-Konbini package (scope src: ${kv.src}). Cross-package-manager scopes aren't available yet.`;

        const repo = manifest.repository.split("/");

        const releases = (await (
            await fetchAPI(`https://api.github.com/repos/${repo[0]}/${repo[1]}/releases`)
        ).json()) as GRA_RELEASE[];
        // github 1st release is always the latest
        if (!releases[0]) throw `Repository for the ${kps} scope does NOT have any releases.`;
        const asset = releases[0]!.assets.find((a) => normalizer(a.name) === normalizer(kv.val));
        if (!asset) throw `Undefined asset for the ${kps} scope.`;

        const sha = releases[0]!.assets.find((a) => a.name === FILENAMES.hashfile);
        if (!sha)
            throw "The author of this package did NOT include a hashfile on the latest version of the package. Without a hashfile we cannot validate download integrity, so we did not install the package, for your safety. Please inform the Konbini team, or, preferably, the package author.";

        const asc = releases[0]!.assets.find((a) => a.name === kv.val + ".asc");
        if (!asc)
            throw "The author of this package did NOT include a PGP signature on the latest version of the package. Without a PGP signature we cannot validate download authenticity, so we did not install the package, for your safety. Please inform the Konbini team, or, preferably, the package author.";

        return {
            coreAsset: asset.browser_download_url,
            pkgVersion: releases[0]!.tag_name,
            shaAsset: sha.browser_download_url,
            ascAsset: asc.browser_download_url,
        };
    }
    export async function authorManifest(authorId: string): Promise<AUTHOR> {
        const manifestPath = [
            locateUsr(authorId),
            `${normalizer(authorId).split(".")[1]}.yaml`,
        ].join("/");
        const response = await fetchAPI(manifestPath);

        if (response.status === 404)
            throw `Author ${authorId} does NOT exist. Perhaps the author misspelled it on their manifest, or something else's not alright.`;
        if (!response.ok)
            throw `Could not access KPI remote for ${authorId}'s manifest (HTTP:${response.status}).`;

        const authorData = await response.text();
        const authorInfo = parse(authorData);
        return authorInfo as AUTHOR;
    }
    /**
     * Downloads given author's GPG signature and returns the path to the downloaded file.
     *
     * @async
     * @param {string} authorId Author ID.
     * @param {string} folderPath Path you want the signature to be saved to. It should be the local publisher DIR.
     * @returns {Promise<string>} Path to the GPG signature.
     */
    export async function authorSignature(authorId: string, folderPath: string): Promise<string> {
        const filePath = join(folderPath, `${authorId}.asc`);
        const signatureAlreadyPresent =
            existsSync(filePath) && (await KbiSecGPG.validateSignature(filePath));
        if (signatureAlreadyPresent) return filePath;

        const signaturePath = [
            locateUsr(authorId),
            `${normalizer(authorId).split(".")[1]}.asc`,
        ].join("/");
        const response = await fetchAPI(signaturePath);

        if (response.status === 404)
            throw `Author ${authorId} does NOT exist. Perhaps the author misspelled it on their manifest, or something else's not alright.`;
        if (!response.ok)
            throw `Could not access KPI remote for ${authorId}'s GPG signature (HTTP:${response.status}).`;

        await downloadHandler({
            remoteUrl: signaturePath,
            filePath,
        });

        return filePath;
    }
}
