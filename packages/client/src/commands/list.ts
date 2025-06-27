import { readdirSync, readFileSync, rmSync, statSync } from "fs";
import { join } from "path";
import { PACKAGES_DIR } from "shared/client";
import { parse } from "yaml";
import { konsole } from "shared/client";
import { isStdScope, FILENAMES, type KONBINI_LOCKFILE, type KPS_SOURCE } from "shared";
import { existsAliasedPackage } from "../toolkit/aliased";

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
    | (Extract<KONBINI_LOCKFILE, { scope: `std:${string}` }> & { path: string })
    | (Extract<KONBINI_LOCKFILE, { scope: Exclude<KPS_SOURCE, `std:${string}`> }> & {
          path: string;
      });

export async function listPackages(
    verbosity: "VERBOSE" | "STANDARD" | "SILENT",
): Promise<EXTENDED_LOCKFILE[]> {
    const lockfiles = findLockFiles(PACKAGES_DIR);
    const pkgsToList: EXTENDED_LOCKFILE[] = [];

    for (const lockfile of lockfiles) {
        const parsed = parse(readFileSync(lockfile, { encoding: "utf-8" }));
        const exists = await existsAliasedPackage(parsed.pkg);
        if (!exists) {
            konsole.dbg(
                "Asserted",
                parsed.pkg,
                "(aliased package) no longer is installed. Removed its lockfile.",
            );
            rmSync(join(lockfile, "../"), { recursive: true, force: true });
        } else {
            pkgsToList.push({ ...parsed, path: lockfile });
        }
    }

    if (pkgsToList.length === 0) {
        if (verbosity !== "SILENT") konsole.adv("No packages here, yet!");
        return [];
    }

    if (verbosity === "SILENT") return pkgsToList.sort();

    for (const pkg of pkgsToList) {
        if (!isStdScope(pkg.scope)) {
            konsole.suc(
                pkg.pkg,
                konsole.clr("grey", "from"),
                konsole.clr("cyan", pkg.scope),
                konsole.clr("grey", "since"),
                konsole.clr("plum", new Date(pkg.installation_ts).toUTCString()),
            );
            if (verbosity === "VERBOSE") {
                konsole.adv("PATH", konsole.clr("brown", pkg.path));
            }
        } else {
            konsole.suc(
                pkg.pkg,
                konsole.clr("grey", "version"),
                konsole.clr("cyan", pkg.version),
                konsole.clr("grey", "since"),
                konsole.clr("plum", new Date(pkg.installation_ts).toUTCString()),
            );
            if (verbosity === "VERBOSE") {
                konsole.adv("SHA512", konsole.clr("red", pkg.installation_hash));
                konsole.adv("PATH", konsole.clr("brown", pkg.path));
            }
        }
    }

    return pkgsToList.sort();
}
