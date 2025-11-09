import { validateAgainst } from "strings-utils";
import { fetchAPI } from "./network.ts";
import { normalizer } from "../constants.ts";
import { isValidManifest } from "../types/manifest.ts";
import type { KONBINI_AUTHOR, KONBINI_ID_PKG, KONBINI_ID_USR } from "../types/author.ts";
import type { KDATA_ENTRY_PKG } from "../types/kdata.ts";

/** Parses an ID and returns it. Throws if it's invalid. */
export function parseID(str: string): {
    /** Prefix. USR or ORG. */
    pref: "usr" | "org";
    /** 2-char long delimiter. */
    delimiter: string;
    /** Author name. */
    user: string;
    /** If this is a pkg ID, the package. Null otherwise. */
    package: string | null;
    /** Author name. */
    user_id: KONBINI_ID_USR;
    /** If this is a pkg ID, the package. Null otherwise. */
    package_id: KONBINI_ID_PKG | null;
} {
    // split scope
    const scopes = normalizer(str).split(".");
    if (scopes.length !== 2 && scopes.length !== 3)
        throw `Invalid author/package ID length (checking ${str})`;
    if (!validateAgainst(scopes[0], ["usr", "org"]))
        throw `Invalid author/package ID prefix (checking ${str}).`;
    if (!scopes[1]) throw `Invalid author/package ID, no 2nd part (checking ${str}).`;
    // get the two 1st letters to locate its directory
    const delimiter = (scopes[2] ?? scopes[1]).slice(0, 2);
    // (can't be too long, we sliced it lol)
    if (delimiter.length !== 2)
        throw `Invalid author/package ID, delimiter too short (checking ${str}).`;
    return {
        pref: scopes[0],
        delimiter,
        user: scopes[1],
        package: scopes[2] ?? null,
        user_id: `${scopes[0]}.${scopes[1]}`,
        package_id: scopes[2] ? `${scopes[0]}.${scopes[1]}.${scopes[2]}` : null,
    };
}

/**
 * Given a package ID, returns an object with its routes to both API and public manifest file.
 *
 * @param {string} pkg Package ID.
 * @returns All URLs.
 */
export function locatePkg(pkg: string): {
    /** Manifest KData route. */
    manifest: string;
    /** Manifest public route, visible from GitHub's UI. */
    manifestPub: string;
} {
    const res = parseID(pkg);
    if (!res.package) throw `No package provided for supposedly package ID (${pkg})`;
    const manifest = `https://konbini-data.vercel.app/api/pkg?id=${pkg}`;
    const manifestPub = `https://github.com/HanaOrg/KonbiniPkgs/blob/main/${res.delimiter}/${res.pref}.${res.user}/${res.package}.yaml`;
    return {
        manifest,
        manifestPub,
    };
}

/**
 * Given a user / org ID, returns an object with its API routes and public routes to manifest and signature files.
 *
 * @param {string} usr User / org ID.
 * @returns All URLs.
 */
export function locateUsr(usr: string): {
    /** Manifest KData route. */
    manifest: string;
    /** Manifest public route, visible from GitHub's UI. */
    manifestPub: string;
    /** Signature GitHub/RAW route. */
    signature: string;
    /** Signature public route, visible from GitHub's UI. */
    signaturePub: string;
} {
    const res = parseID(usr);
    const manifest = `https://konbini-data.vercel.app/api/author?id=${usr}`;
    const manifestPub = `https://github.com/HanaOrg/KonbiniAuthors/blob/main/${res.pref}/${res.delimiter}/${res.user}.yaml`;
    const signature = [
        "https://raw.githubusercontent.com/HanaOrg/KonbiniAuthors/main",
        res.pref,
        res.delimiter,
        res.user + ".asc",
    ].join("/");
    const signaturePub = signature
        .replace("raw.githubusercontent", "github")
        .replace("main", "blob/main");
    return {
        manifest,
        manifestPub,
        signature,
        signaturePub,
    };
}

/**
 * Fetches the manifest of the given package, if it exists.
 *
 * @async
 * @param {string} packageName
 * @returns {Promise<KDATA_ENTRY_PKG>}
 */
export async function getPkgManifest(packageName: string): Promise<KDATA_ENTRY_PKG> {
    const manifestPath = locatePkg(packageName).manifest;
    const response = await fetchAPI(manifestPath, "GET");

    if (response.status === 404) {
        throw `Package ${packageName} does NOT exist. Perhaps you misspelled it.`;
    }
    if (!response.ok) {
        throw `Could not access KonbiniAPI remote for ${packageName} (HTTP:${response.status}).`;
    }

    const json = await response.json();
    if (!isValidManifest(json)) {
        throw `The manifest for ${packageName} was invalidated. Its author made a mistake somewhere. Notify them.`;
    }
    return json as KDATA_ENTRY_PKG;
}

export async function getUsrManifest(authorId: string): Promise<KONBINI_AUTHOR> {
    const response = await fetchAPI(locateUsr(authorId).manifest);

    if (response.status === 404) {
        throw `Author ${authorId} does NOT exist. Perhaps the author misspelled it on their manifest, or something else's not alright.`;
    }
    if (!response.ok) {
        throw `Could not access KonbiniAPI remote for ${authorId}'s manifest (HTTP:${response.status}).`;
    }

    const authorData = await response.text();
    const authorInfo = Bun.YAML.parse(authorData);
    return authorInfo as KONBINI_AUTHOR;
}
