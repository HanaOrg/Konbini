import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { INSTALL_DIR } from "../constants";
import { parse } from "yaml";
import { konsole } from "../toolkit/konsole";
import { FILENAMES, type KONBINI_LOCKFILE, type KPS_SOURCE } from "shared";

function findLockFiles(dir: string, filename = FILENAMES.lockfile): string[] {
    const results: string[] = [];

    for (const entry of readdirSync(dir)) {
        const fullPath = join(dir, entry);
        const stats = statSync(fullPath);

        if (stats.isDirectory()) {
            results.push(...findLockFiles(fullPath, filename)); // recursive
        } else if (entry === filename) {
            results.push(fullPath);
        }
    }

    return results;
}

type EXTENDED_LOCKFILE =
    | (Extract<KONBINI_LOCKFILE, { scope: "std" }> & { path: string })
    | (Extract<KONBINI_LOCKFILE, { scope: Exclude<KPS_SOURCE, "std"> }> & { path: string });

export async function listPackages(
    verbosity: "VERBOSE" | "STANDARD" | "SILENT",
): Promise<EXTENDED_LOCKFILE[]> {
    const lockfiles = findLockFiles(INSTALL_DIR);
    const pkgsToList: EXTENDED_LOCKFILE[] = [];

    for (const lockfile of lockfiles) {
        const content = readFileSync(lockfile, { encoding: "utf-8" });
        const parsed = parse(content);
        pkgsToList.push({ ...parsed, path: lockfile });
    }

    if (pkgsToList.length === 0) {
        if (verbosity !== "SILENT") konsole.adv("Uh... No packages here, yet!");
        return [];
    }

    if (verbosity === "SILENT") return pkgsToList;

    for (const pkg of pkgsToList) {
        if (pkg.scope !== "std") {
            konsole.suc(
                pkg.pkg,
                konsole.clr("grey", "from"),
                konsole.clr("cyan", pkg.scope),
                konsole.clr("grey", "since"),
                konsole.clr("plum", new Date(pkg.timestamp).toUTCString()),
            );
            if (verbosity === "VERBOSE") {
                konsole.adv("PATH", konsole.clr("brown", pkg.path));
            }
        } else {
            konsole.suc(
                pkg.pkg,
                konsole.clr("grey", "version"),
                konsole.clr("cyan", pkg.ver),
                konsole.clr("grey", "since"),
                konsole.clr("plum", new Date(pkg.timestamp).toUTCString()),
            );
            if (verbosity === "VERBOSE") {
                konsole.adv("SHA512", konsole.clr("red", pkg.current_sha));
                konsole.adv("PATH", konsole.clr("brown", pkg.path));
            }
        }
    }

    return pkgsToList.sort();
}
