import { validateAgainst } from "@zakahacecosas/string-utils";
import { parse } from "yaml";
import { b64toString, fetchAPI } from "./network.ts";
import { normalizer, SRCSET } from "../constants.ts";
import { isValidManifest, type KONBINI_MANIFEST } from "../types/manifest.ts";
import type { KONBINI_AUTHOR } from "../types/author.ts";

/** Splits an ID. Throws if it's invalid. */
function splitID(str: string): {
    /** Prefix. USR or ORG. */
    pref: "usr" | "org";
    /** 2-char long delimiter. */
    delimiter: string;
    /** Author name. */
    user: string;
    /** If this is a pkg ID, the package. Null otherwise. */
    package: string | null;
} {
    // split scope
    const scopes = normalizer(str).split(".");
    if (scopes.length !== 2 && scopes.length !== 3)
        throw `Invalid author/package ID length (${scopes.length} && ${scopes})`;
    if (!validateAgainst(scopes[0], ["usr", "org"]))
        throw `Invalid author/package ID prefix (${scopes})`;
    if (!scopes[1]) throw `No 2nd part of author/package ID (${scopes}).`;
    // get the two 1st letters to locate its directory
    const delimiter = (scopes[2] ?? scopes[1]).slice(0, 2);
    // (can't be too long, we sliced it lol)
    if (delimiter.length !== 2) throw "Delimiter too short.";
    return {
        pref: scopes[0],
        delimiter,
        user: scopes[1],
        package: scopes[2] ?? null,
    };
}

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
export function locatePkg(
    pkg: string,
    src: "R" | "A" = "R",
): {
    /** Manifest `R` or `A` route. */
    manifest: string;
    /** Manifest public route, visible from GitHub's UI. */
    manifestPub: string;
} {
    const res = splitID(pkg);
    if (!res.package) throw `No package provided for supposedly package ID (${pkg})`;
    const root = [
        src === "R" ? SRCSET.PKGsR : SRCSET.PKGsA,
        res.delimiter,
        `${res.pref}.${res.user}`,
    ].join("/");
    const manifest = [root, res.package+".yaml"].join("/");
       console.debug("P", manifest);
 const manifestPub = manifest
        .replace("raw.githubusercontent", "github")
        .replace("main", "blob/main");
    return {
        manifest,
        manifestPub,
    };
}

/**
 * Given a user / org name, returns the root of its KPI SOURCE route.
 *
 * @param {string} usr User / org name.
 * @example
 * ```ts
 * // imagine the AuthorsRegistry root URL is "konbini.sample/authors/"
 * KPI.locateUsr("org.hana");
 * // returns "https://konbini.samle/authors/org/ha"
 * ```
 * @returns {string} String URL.
 */
export function locateUsr(
    usr: string,
    src: "R" | "A" = "R",
): {
    /** Manifest `R` or `A` route. */
    manifest: string;
    /** Manifest public route, visible from GitHub's UI. */
    manifestPub: string;
    /** Signature `R` or `A` route. */
    signature: string;
    /** Signature public route, visible from GitHub's UI. */
    signaturePub: string;
} {
    const res = splitID(usr);
    const root = [src === "R" ? SRCSET.USRsR : SRCSET.USRsA, res.pref, res.delimiter].join("/");
    const manifest = [root, res.user + ".yaml"].join("/");
    console.debug("U", manifest);
    const manifestPub = manifest
        .replace("raw.githubusercontent", "github")
        .replace("main", "blob/main");
    const signature = [root, res.user + ".asc"].join("/");
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
 * @returns {string}
 */
export async function getPkgManifest(
    packageName: string,
    useApi: boolean = false,
): Promise<KONBINI_MANIFEST> {
    const manifestPath = locatePkg(packageName, useApi ? "A" : "R").manifest;
    const response = await fetchAPI(manifestPath, "GET");

    if (response.status === 404) {
        throw `Package ${packageName} does NOT exist. Perhaps you misspelled it.`;
    }
    if (!response.ok) {
        throw `Could not access KPI remote for ${packageName} (HTTP:${response.status}).`;
    }

    if (!useApi) {
        const packageData = await response.text();
        const packageInfo = parse(packageData);
        if (!isValidManifest(packageInfo)) {
            throw `The manifest for ${packageName} was invalidated. Its author has made a mistake, somewhere. Tell them to check it.`;
        }
        return packageInfo;
    }
    const json = await response.json();
    const res = await (await fetchAPI(json.url)).json();
    const packageInfoB = parse(b64toString(res.content));
    if (!isValidManifest(packageInfoB)) {
        throw `The manifest for ${packageName} was invalidated. Its author has made a mistake, somewhere. Tell them to check it.`;
    }
    return packageInfoB;
}

export async function getUsrManifest(authorId: string): Promise<KONBINI_AUTHOR> {
    const manifestPath = [locateUsr(authorId), `${normalizer(authorId).split(".")[1]}.yaml`].join(
        "/",
    );
    const response = await fetchAPI(manifestPath);

    if (response.status === 404) {
        throw `Author ${authorId} does NOT exist. Perhaps the author misspelled it on their manifest, or something else's not alright.`;
    }
    if (!response.ok) {
        throw `Could not access KPI remote for ${authorId}'s manifest (HTTP:${response.status}).`;
    }

    const authorData = await response.text();
    const authorInfo = parse(authorData);
    return authorInfo as KONBINI_AUTHOR;
}
