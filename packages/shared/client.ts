import { normalize } from "strings-utils";
import { join } from "path";
import { homedir } from "os";
import { getPlatform } from "./api/platform";

const ROOT = join(homedir(), ".kbi");

/** Root folder where all Konbini packages are installed.
 * @constant **\/home/USER/.kbi/pkgs** OR **C:\\Users\\USER\\kbi\\pkgs**
 */
export const PACKAGES_DIR = join(ROOT, "pkgs");

/** Root folder where all Konbini packages are launched from.
 * @constant **\/home/USER/.kbi/launchpad** OR **C:\\Users\\USER\\kbi\\launchpad**
 */
export const LAUNCHPAD_DIR = join(ROOT, "launchpad");

/** Root folder where all Konbini executables live.
 * @constant **\/home/USER/.kbi/exe** OR **C:\\Users\\USER\\kbi\\exe**
 */
export const INSTALLATION_DIR = join(ROOT, "exe");

/** Root folder where all Konbini-generated PGP signatures live.
 * @constant **\/home/USER/.kbi/pgp** OR **C:\\Users\\USER\\kbi\\pgp**
 */
export const SIGNATURE_DIR = join(ROOT, "pgp");

/** Root folder where all Konbini configurations live.
 * @constant **\/home/USER/.kbi/cfg** OR **C:\\Users\\USER\\kbi\\cfg**
 */
export const CFG_DIR = join(ROOT, "cfg");

/** This "constant" is actually a function. Pass the name of the package and its author and it'll generate the installation path.
 * @example
 * ```ts
 * PKG_PATH({pkg: "foobar", author: "usr.foo"});
 * // returns "/home/USER/.kbi/usr.foo/foobar"
 * ```
 */
export function PKG_PATH(p: { pkg: string; author: string }): string {
    return join(PACKAGES_DIR, normalize(p.author), normalize(p.pkg));
}

/** This "constant" is actually a function. Pass the name of the author and it'll generate his package installation path.
 * @example
 * ```ts
 * PKG_PATH({pkg: author: "usr.foo"});
 * // returns "/home/USER/.kbi/usr.foo"
 * ```
 */
export function USR_PATH(p: { author: string }): string {
    return join(PACKAGES_DIR, normalize(p.author));
}

/** This "constant" is actually a function. Pass the name of the package and its author and it'll generate the launchpad file path.
 * @example
 * ```ts
 * LAUNCHPAD_DIR({pkg: "foobar", author: "usr.foo"});
 * // returns "/home/USER/.kbi/launchpad/usr.foo/foobar.sh"
 * ```
 */
export function LAUNCHPAD_FILE_PATH(p: { pkg: string; author: string }): string {
    return join(LAUNCHPAD_DIR, `${normalize(p.pkg)}.${getPlatform() === "win64" ? "ps1" : "sh"}`);
}

const R = "\x1b[0m";

function nl(stuff: any[]) {
    return stuff.map((s) => (typeof s === "string" ? s.replaceAll("\n", "\n      ") : s));
}

/** Konbini's beautiful console logging. */
export const konsole = {
    /** Colors a CLI string. */
    clr(color: Bun.ColorInput, string: string, res: boolean = true): string {
        return `${Bun.color(color, "ansi-16m")}${string}${res ? R : ""}`;
    },
    /** Logs an error. */
    err(...stuff: any[]): void {
        console.error(this.clr("crimson", "[ X ]", false), ...nl(stuff), R);
    },
    /** Logs a warning. */
    war(...stuff: any[]): void {
        console.warn(this.clr("yellow", "[ ~ ]", false), ...nl(stuff), R);
    },
    /** Logs an information / "debug" message. */
    dbg(...stuff: any[]): void {
        console.log(this.clr("grey", "[ D ]", false), ...nl(stuff), R);
    },
    /** Logs a success message. */
    suc(...stuff: any[]): void {
        console.log(this.clr("lightgreen", "[ ✓ ]", false), ...nl(stuff), R);
    },
    /** Logs an advancement message (signaling a step out of many on whatever process is going on). */
    adv(...stuff: any[]): void {
        console.log(this.clr("#DEDEDE", "[ > ]", false), ...nl(stuff), R);
    },
    /** Asks the user for confirmation. */
    ask(question: string): boolean {
        return confirm(this.clr("gold", `[ ? ] ${question}`));
    },
    /** Logs a question message (without actually asking anything). */
    que(...stuff: string[]): void {
        console.log(this.clr("gold", "[ ? ]", false), ...nl(stuff), R);
    },
    /** Logs a heads up message. */
    out(...stuff: string[]): void {
        console.log(this.clr("gold", "[ ! ]", false), ...nl(stuff), R);
    },
};
