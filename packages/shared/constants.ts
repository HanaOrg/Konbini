import { normalize } from "strings-utils";

/** Repeated filenames. Exported so you don't mess them up. */
export const FILENAMES = {
    /** Lockfile for installed packages. */
    lockfile: "kbi.lock",
    /** Hashfile for standard releasing. */
    hashfile: "sha.yaml",
} as const;

/** Normalizes strings. */
export function normalizer(str: string): string {
    return normalize(str, {
        preserveCase: false,
        strict: false,
        removeCliColors: true,
    });
}
