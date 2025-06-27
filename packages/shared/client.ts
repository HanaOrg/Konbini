import { normalize } from "@zakahacecosas/string-utils";
import { join } from "path";
import { homedir } from "os";
import { getPlatform } from "shared";

const ROOT = getPlatform() === "win64" ? join(homedir(), "kbi") : "/usr/local/kbi";

/** Root folder where all Konbini packages are installed. It's global, thus requires `sudo` to be accessed.
 * @constant **\/usr/local/kbi/pkgs** OR **C:\\Users\\USER\\kbi\\pkgs**
 */
export const PACKAGES_DIR = join(ROOT, "pkgs");

/** Root folder where all Konbini packages are launched from.
 * @constant **\/usr/local/kbi/launchpad** OR **C:\\Users\\USER\\kbi\\launchpad**
 */
export const LAUNCHPAD_DIR = join(ROOT, "launchpad");

/** Root folder where all Konbini executables live.
 * @constant **\/usr/local/kbi/exe** OR **C:\\Users\\USER\\kbi\\exe**
 */
export const INSTALLATION_DIR = join(ROOT, "exe");

/** Root folder where all Konbini-generated PGP signatures live.
 * @constant **\/usr/local/kbi/pgp** OR **C:\\Users\\USER\\kbi\\pgp**
 */
export const SIGNATURE_DIR = join(ROOT, "pgp");

/** This "constant" is actually a function. Pass the name of the package and its author and it'll generate the installation path.
 * @example
 * ```ts
 * PKG_PATH({pkg: "foobar", author: "usr.foo"});
 * // returns "/usr/local/kbi/usr.foo/foobar"
 * ```
 */
export function PKG_PATH(p: { pkg: string; author: string }): string {
    return join(PACKAGES_DIR, normalize(p.author), normalize(p.pkg));
}

/** This "constant" is actually a function. Pass the name of the author and it'll generate his package installation path.
 * @example
 * ```ts
 * PKG_PATH({pkg: author: "usr.foo"});
 * // returns "/usr/local/kbi/usr.foo"
 * ```
 */
export function USR_PATH(p: { author: string }): string {
    return join(PACKAGES_DIR, normalize(p.author));
}

/** This "constant" is actually a function. Pass the name of the package and its author and it'll generate the launchpad file path.
 * @example
 * ```ts
 * LAUNCHPAD_DIR({pkg: "foobar", author: "usr.foo"});
 * // returns "/usr/local/kbi/launchpad/usr.foo/foobar.sh"
 * ```
 */
export function LAUNCHPAD_FILE_PATH(p: { pkg: string; author: string }): string {
    return join(LAUNCHPAD_DIR, `${normalize(p.pkg)}.${getPlatform() === "win64" ? "ps1" : "sh"}`);
}

/** Konbini's beautiful console logging. */
export namespace konsole {
    const R = Bun.color("white", "ansi-16m");

    /** Colors a CLI string. */
    export function clr(color: Bun.ColorInput, string: string, res: boolean = true): string {
        return `${Bun.color(color, "ansi-16m")}${string}${res ? R : ""}`;
    }
    /** Logs an error. */
    export function err(...stuff: any[]): void {
        console.error(clr("crimson", "[ X ]", false), ...stuff, R);
    }
    /** Logs a warning. */
    export function war(...stuff: any[]): void {
        console.warn(clr("yellow", "[ ~ ]", false), ...stuff, R);
    }
    /** Logs an information / "debug" message. */
    export function dbg(...stuff: any[]): void {
        console.debug(clr("grey", "[ D ]", false), ...stuff, R);
    }
    /** Logs a success message. */
    export function suc(...stuff: any[]): void {
        console.log(clr("lightgreen", "[ ✓ ]", false), ...stuff, R);
    }
    /** Logs an advancement message (signaling a step out of many on whatever process is going on). */
    export function adv(...stuff: any[]): void {
        console.log("[ > ]", ...stuff, R);
    }
    /** Asks the user for confirmation. */
    export function ask(question: string): boolean {
        return confirm(clr("gold", `[ ? ] ${question}`));
    }
    /** Logs a question message (without actually asking anything). */
    export function que(...stuff: string[]): void {
        console.log(clr("gold", "[ ? ]", false), ...stuff, R);
    }
    /** Logs a heads up message. */
    export function out(...stuff: string[]): void {
        console.log(clr("gold", "[ ! ]", false), ...stuff, R);
    }
}
