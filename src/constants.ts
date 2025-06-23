import { normalize } from "@zakahacecosas/string-utils";
import { join } from "path";
import { getPlatform } from "./toolkit/platform";
import { homedir } from "os";

// NOTE - move this somewhere else
export function normalizer(str: string): string {
    return normalize(str, {
        preserveCase: false,
        strict: false,
        removeCliColors: true,
    });
}

/** All source sets for the KPI */
export const SRCSET = {
    /** Package Registry (`HanaOrg/KonbiniPkgs`) */
    PKGs: "https://raw.githubusercontent.com/HanaOrg/KonbiniPkgs/main",
    /** Authors Registry (`HanaOrg/KonbiniAuthors`) */
    USRs: "https://raw.githubusercontent.com/HanaOrg/KonbiniAuthors/main",
} as const;

const ROOT = getPlatform() === "win64" ? join(homedir(), "kbi") : "/usr/local/kbi";

/** Root folder where all Konbini packages are installed. It's global, thus requires `sudo` to be accessed.
 * @constant **\/usr/local/kbi/pkgs** OR **C:\\Users\\USER\\kbi\\pkgs**
 */
export const INSTALL_DIR = join(ROOT, "pkgs");

/** Root folder where all Konbini packages are launched from.
 * @constant **\/usr/local/kbi/launchpad** OR **C:\\Users\\USER\\kbi\\launchpad**
 */
export const LAUNCHPAD_DIR = join(ROOT, "launchpad");

/** This "constant" is actually a function. Pass the name of the package and its author and it'll generate the installation path.
 * @example
 * ```ts
 * PKG_PATH({pkg: "foobar", author: "usr.Foo"});
 * // returns "/usr/local/kbi/usr.foo/foobar"
 * ```
 */
export function PKG_PATH(p: { pkg: string; author: string }): string {
    return join(INSTALL_DIR, normalize(p.author), normalize(p.pkg));
}

/** This "constant" is actually a function. Pass the name of the author and it'll generate his package installation path.
 * @example
 * ```ts
 * PKG_PATH({pkg: author: "usr.Foo"});
 * // returns "/usr/local/kbi/usr.foo"
 * ```
 */
export function USR_PATH(p: { author: string }): string {
    return join(INSTALL_DIR, normalize(p.author));
}

/** This "constant" is actually a function. Pass the name of the package and its author and it'll generate the launchpad file path.
 * @example
 * ```ts
 * LAUNCHPAD_DIR({pkg: "foobar", author: "usr.Foo"});
 * // returns "/usr/local/kbi/launchpad/usr.foo/foobar.sh"
 * ```
 */
export function LAUNCHPAD_FILE_PATH(p: { pkg: string; author: string }): string {
    return join(LAUNCHPAD_DIR, `${normalize(p.pkg)}.${getPlatform() === "win64" ? "ps1" : "sh"}`);
}

/** Repeated filenames. Exported so you don't mess them up. */
export const FILENAMES = {
    lockfile: "konbini.lock.yaml",
    hashfile: "konbini.hash.yaml",
} as const;
