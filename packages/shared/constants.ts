import { normalize } from "@zakahacecosas/string-utils";

/** Repeated filenames. Exported so you don't mess them up. */
export const FILENAMES = {
    /** Lockfile for installed packages. */
    lockfile: "konbini.lock.yaml",
    /** Hashfile for standard releasing. */
    hashfile: "konbini.hash.yaml",
} as const;

/** Normalizes strings. */
export function normalizer(str: string): string {
    return normalize(str, {
        preserveCase: false,
        strict: false,
        removeCliColors: true,
    });
}
