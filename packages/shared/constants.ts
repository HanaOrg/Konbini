import { normalize } from "@zakahacecosas/string-utils";

/** All source sets for the KPI.
 *
 * Prefer `R` (raw) resources when possible. They're not ratelimited, but cannot be used anywhere.
 *
 * Use `A` (API) resources when needed. Ratelimited, but can be used anywhere you need.
 */
export const SRCSET = {
    /** Package Registry (`HanaOrg/KonbiniPkgs`) [`R`] */
    PKGsR: "https://raw.githubusercontent.com/HanaOrg/KonbiniPkgs/main",
    /** Package Registry (`HanaOrg/KonbiniPkgs`) [`A`] */
    PKGsA: "https://api.github.com/repos/HanaOrg/KonbiniPkgs/contents/",
    /** Authors Registry (`HanaOrg/KonbiniAuthors`) */
    USRsR: "https://raw.githubusercontent.com/HanaOrg/KonbiniAuthors/main",
} as const;

/** Repeated filenames. Exported so you don't mess them up. */
export const FILENAMES = {
    /** Lockfile for installed packages. */
    lockfile: "konbini.lock.yaml",
    /** Hashfile for standard releasing. */
    hashfile: "konbini.hash.yaml",
} as const;

export function normalizer(str: string): string {
    return normalize(str, {
        preserveCase: false,
        strict: false,
        removeCliColors: true,
    });
}
