import type { KONBINI_PKG_SCOPE } from "./manifest.ts";

interface KONBINI_ALI_LOCKFILE {
    /** Package name. */
    pkg: string;
    /** Exact timestamp of the installation. */
    installation_ts: string;
    /** Package scope. */
    scope: Exclude<KONBINI_PKG_SCOPE, `std:${string}`>;
}

interface KONBINI_STD_LOCKFILE {
    /** Package name. */
    pkg: string;
    /** Exact timestamp of the installation. */
    installation_ts: string;
    /** Package scope. */
    scope: `std:${string}`;
    /** Version of the package. */
    version: string;
    /** Package remote URL. */
    remote_url: string;
    /** SHA3-512 hash of the currently installed download. */
    installation_hash: string;
}

/** A Konbini lockfile that accompanies each package. */
export type KONBINI_LOCKFILE = KONBINI_ALI_LOCKFILE | KONBINI_STD_LOCKFILE;

/** Checks if a lockfile belongs to a Konbini package. */
export function isStdLockfile(lockfile: KONBINI_LOCKFILE): lockfile is KONBINI_STD_LOCKFILE {
    return lockfile.scope.startsWith("std:");
}

/**
 * A Konbini hashfile. MUST be present on a project's GitHub release for it to be downloadable.
 *
 * @export
 * @interface KONBINI_HASHFILE
 */
export interface KONBINI_HASHFILE {
    /**
     * 64-bits Linux executable hash.
     *
     * @type {?string}
     */
    linux_64_sha?: string;
    /**
     * ARM Linux executable hash.
     *
     * @type {?string}
     */
    linux_arm_sha?: string;
    /**
     * 64-bits (INTEL) macOS executable hash.
     *
     * @type {?string}
     */
    mac_64_sha?: string;
    /**
     * ARM (SILICON) macOS executable hash.
     *
     * @type {?string}
     */
    mac_arm_sha?: string;
    /**
     * 64-bits Microsoft Windows executable hash.
     *
     * @type {?string}
     */
    win64_sha?: string;
}
