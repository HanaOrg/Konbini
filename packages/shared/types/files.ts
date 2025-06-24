import type { KPS_SOURCE } from "./manifest.ts";

/** A Konbini lockfile that accompanies each package. */
export type KONBINI_LOCKFILE =
    | {
          /** Version of the package. Should follow SemVer, although it being user provided means it doesn't necessarily do. */
          ver: string;
          /** Package name. */
          pkg: string;
          /** Package remote URL. */
          remote: string;
          /** Exact timestamp of the installation. */
          timestamp: string;
          /** SHA3-512 hash of the currently installed download. */
          current_sha: string;
          /** Package scope. */
          scope: "std";
      }
    | {
          /** Package name. */
          pkg: string;
          /** Exact timestamp of the installation. */
          timestamp: string;
          /** Package scope. */
          scope: Exclude<KPS_SOURCE, "std">;
      };

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
