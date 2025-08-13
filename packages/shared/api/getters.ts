import { fetchAPI } from "./network.ts";
import { validatePGPSignature } from "../security.ts";
import { existsSync } from "fs";
import { join } from "path";
import type { RELEASE_GH_CB, RELEASE_GL } from "../types/git.ts";
import { FILENAMES, normalizer } from "../constants.ts";
import {
    isKbiScope,
    parseRepositoryScope,
    type KONBINI_MANIFEST,
    type KONBINI_PKG_SCOPE,
} from "../types/manifest.ts";
import { downloadHandler } from "./download.ts";
import { locateUsr } from "./core.ts";
import { parseKps } from "./manifest.ts";
import { replace } from "@zakahacecosas/string-utils";

/** Given a package manifest and the desired KPS, returns the absolute URL to its downloadable file. */
export async function getPkgRemotes(
    kps: KONBINI_PKG_SCOPE,
    manifest: KONBINI_MANIFEST,
): Promise<{
    shaAsset: string;
    ascAsset: string;
    coreAsset: string;
    pkgVersion: string;
    pkgReleaseDate: string;
}> {
    const kv = parseKps(kps);
    if (!isKbiScope(kps)) {
        throw `KPI attempt to fetch remotes for a non-Konbini package (KPS: ${kps}). Aliased scopes don't work this way.\nThis is likely a bug in Konbini's code.`;
    }
    if (!manifest.repository) {
        throw `KPI attempt to fetch remotes without a repository. The author of this package didn't specify the repository where his package is hosted.`;
    }

    /** rs as in repository scope */
    const rs = manifest.repository;
    const url = parseRepositoryScope(rs).releases;

    const releases = await (await fetchAPI(url)).json();

    const release: RELEASE_GH_CB | RELEASE_GH_CB | RELEASE_GL = rs.startsWith("gl")
        ? (releases[0] as RELEASE_GL)
        : rs.startsWith("cb")
          ? (releases as RELEASE_GH_CB)
          : (releases as RELEASE_GH_CB);

    // github 1st release is always the latest
    if (!release) {
        throw `Repository for the ${kps} scope does NOT have any releases.`;
    }

    const assets = (
        url.startsWith("gl") ? (release as RELEASE_GL).assets.links : release.assets
    ) as ({ url: string; name: string } | { browser_download_url: string; name: string })[];

    const versionedName = replace(kv.value, {
        "[[VER]]": release.tag_name,
    });

    const asset = assets.find((a) => normalizer(a.name) === normalizer(versionedName));
    if (!asset) {
        throw `Undefined asset for the ${kps} scope.`;
    }

    const sha = assets.find((a) => a.name === FILENAMES.hashfile);
    if (!sha) {
        throw "The author of this package did NOT include a hashfile on the latest version of the package. Without a hashfile we cannot validate download integrity, so we did not install the package, for your safety. Please inform the Konbini team, or, preferably, the package author.";
    }

    const asc = assets.find((a) => a.name === kv.value + ".asc");
    if (!asc) {
        throw "The author of this package did NOT include a PGP signature on the latest version of the package. Without a PGP signature we cannot validate download authenticity, so we did not install the package, for your safety. Please inform the Konbini team, or, preferably, the package author.";
    }

    const getUrl = (i: typeof asc) =>
        url.startsWith("gl") ? (i as any).url : (i as any).browser_download_url;

    return {
        shaAsset: getUrl(sha),
        ascAsset: getUrl(asc),
        coreAsset: getUrl(asset),
        pkgVersion: release.tag_name,
        pkgReleaseDate: release.published_at,
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
        throw `Author ${authorId} does NOT have a valid signature (or at least, we didn't find one). Report this issue, please.`;
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
