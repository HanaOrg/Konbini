import { validateAgainst } from "@zakahacecosas/string-utils";
import { parse } from "yaml";
import { b64toString, fetchAPI } from "./network.ts";
import { normalizer, SRCSET } from "../constants.ts";
import { isValidManifest, type KONBINI_MANIFEST } from "../types/manifest.ts";
import type { KONBINI_AUTHOR } from "../types/author.ts";

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
export function locatePkg(pkg: string, src: "R" | "A" = "R"): string {
    const SOURCE = src === "R" ? SRCSET.PKGsR : SRCSET.PKGsA;
    // get the two 1st letters to locate its directory
    return [SOURCE, normalizer(pkg).slice(0, 2)].join("/");
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
export function locateUsr(usr: string): string {
    // split scope
    const scopes = normalizer(usr).split(".");
    if (scopes.length !== 2) {
        throw `Invalid author ID length (${scopes.length} && ${scopes})`;
    }
    if (!validateAgainst(scopes[0], ["usr", "org"])) {
        throw `Invalid author ID prefix (${scopes})`;
    }
    // get the two 1st letters to locate its directory
    const prefix = normalizer(usr).split(".")[1]!.slice(0, 2);
    return [SRCSET.USRsR, scopes[0], prefix].join("/");
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
    const manifestPath = [
        locatePkg(packageName, useApi ? "A" : "R"),
        `${normalizer(packageName)}.yaml`,
    ].join("/");
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
