import { parseKps } from "./manifest.ts";
import { fetchAPI } from "./network.ts";
import { validatePGPSignature } from "../security.ts";
import { existsSync } from "fs";
import { join } from "path";
import type { GRA_RELEASE } from "../types/github.ts";
import { FILENAMES, normalizer } from "../constants.ts";
import type { KONBINI_MANIFEST, KONBINI_PKG_SCOPE } from "../types/manifest.ts";
import { downloadHandler } from "./download.ts";
import { locateUsr } from "./core.ts";

/** Given a package manifest and the desired KPS, returns the absolute URL to its downloadable file. */
export async function getPkgRemotes(
    kps: KONBINI_PKG_SCOPE,
    manifest: KONBINI_MANIFEST,
): Promise<{
    coreAsset: string;
    pkgVersion: string;
    shaAsset: string;
    ascAsset: string;
}> {
    const kv = parseKps(kps);
    if (kv.src !== "std") {
        throw `KPI attempt to fetch remotes for a non-Konbini package (scope src: ${kv.src}). Aliased scopes don't work this way.\nThis is likely a bug in Konbini's code.`;
    }
    if (!manifest.repository) {
        throw `KPI attempt to fetch remotes without a repository. The author of this package didn't specify the repository where his package his hosted.`;
    }

    const repo = manifest.repository.split("/");

    const releases = (await (
        await fetchAPI(`https://api.github.com/repos/${repo[0]}/${repo[1]}/releases`)
    ).json()) as GRA_RELEASE[];
    // github 1st release is always the latest
    if (!releases[0]) {
        throw `Repository for the ${kps} scope does NOT have any releases.`;
    }
    const asset = releases[0]!.assets.find((a) => normalizer(a.name) === normalizer(kv.val));
    if (!asset) {
        throw `Undefined asset for the ${kps} scope.`;
    }

    const sha = releases[0]!.assets.find((a) => a.name === FILENAMES.hashfile);
    if (!sha) {
        throw "The author of this package did NOT include a hashfile on the latest version of the package. Without a hashfile we cannot validate download integrity, so we did not install the package, for your safety. Please inform the Konbini team, or, preferably, the package author.";
    }

    const asc = releases[0]!.assets.find((a) => a.name === kv.val + ".asc");
    if (!asc) {
        throw "The author of this package did NOT include a PGP signature on the latest version of the package. Without a PGP signature we cannot validate download authenticity, so we did not install the package, for your safety. Please inform the Konbini team, or, preferably, the package author.";
    }

    return {
        coreAsset: asset.browser_download_url,
        pkgVersion: releases[0]!.tag_name,
        shaAsset: sha.browser_download_url,
        ascAsset: asc.browser_download_url,
    };
}

/**
 * Downloads given author's PGP signature and returns the path to the downloaded file.
 *
 * @async
 * @param {string} authorId Author ID.
 * @param {string} folderPath Path you want the signature to be saved to. It should be the local publisher DIR.
 * @returns {Promise<string>} Path to the PGP signature.
 */
export async function getUsrSignature(authorId: string, folderPath: string): Promise<string> {
    const filePath = join(folderPath, `${authorId}.asc`);
    const signatureAlreadyPresent = existsSync(filePath) && (await validatePGPSignature(filePath));
    if (signatureAlreadyPresent) {
        return filePath;
    }

    const signaturePath = [locateUsr(authorId), `${normalizer(authorId).split(".")[1]}.asc`].join(
        "/",
    );
    const response = await fetchAPI(signaturePath);

    if (response.status === 404) {
        throw `Author ${authorId} does NOT exist. Perhaps the author misspelled it on their manifest, or something else's not alright.`;
    }
    if (!response.ok) {
        throw `Could not access KPI remote for ${authorId}'s PGP signature (HTTP:${response.status}).`;
    }

    await downloadHandler({
        remoteUrl: signaturePath,
        filePath,
    });

    return filePath;
}
