import type { KONBINI_ID_PKG } from "./author.ts";
import type { KONBINI_PKG_SCOPE } from "./manifest.ts";

interface KONBINI_ALI_LOCKFILE {
    /** Package name. */
    pkg_id: KONBINI_ID_PKG | `kbi.grabbed.${KONBINI_PKG_SCOPE}`;
    /** Exact timestamp of the installation. */
    timestamp: string;
    /** Package scope. */
    scope: Exclude<KONBINI_PKG_SCOPE, `kbi:${string}`>;
}

interface KONBINI_KBI_LOCKFILE extends Omit<KONBINI_ALI_LOCKFILE, "scope"> {
    /** Package scope. */
    scope: `kbi:${string}`;
    /** Version of the package. */
    version: string;
    /** Package remote URL. */
    remote_url: string;
    /** SHA3-512 hash of the currently installed download. */
    installation_hash: string;
}

/** A Konbini lockfile that accompanies each package. */
export type KONBINI_LOCKFILE = KONBINI_ALI_LOCKFILE | KONBINI_KBI_LOCKFILE;

/** Checks if a lockfile belongs to a Konbini package. */
export function isKbiLockfile(lockfile: KONBINI_LOCKFILE): lockfile is KONBINI_KBI_LOCKFILE {
    return lockfile.scope.startsWith("kbi:");
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
    linux64?: string;
    /**
     * ARM Linux executable hash.
     *
     * @type {?string}
     */
    linuxArm?: string;
    /**
     * 64-bits (INTEL) macOS executable hash.
     *
     * @type {?string}
     */
    mac64?: string;
    /**
     * ARM (SILICON) macOS executable hash.
     *
     * @type {?string}
     */
    macArm?: string;
    /**
     * 64-bits Microsoft Windows executable hash.
     *
     * @type {?string}
     */
    win64?: string;
}
