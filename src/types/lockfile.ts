import type { KPS_SOURCE } from "./manifest";

/** A Konbini lockfile that accompanies each package. */
export type KONBINI_PKG_LOCKFILE =
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
