import { readdirSync, readFileSync, rmSync } from "fs";
import { join } from "path";
import { PACKAGES_DIR } from "shared/client";
import { parse } from "yaml";
import { konsole } from "shared/client";
import { packageExists } from "../toolkit/aliased";
import { FILENAMES } from "shared/constants";
import type { KONBINI_LOCKFILE } from "shared/types/files";
import { parseKps } from "shared/api/manifest";
import { isKbiScope } from "../../../shared/types/manifest";

function findLockFiles(dir: string, filename: string = FILENAMES.lockfile): string[] {
    const results: string[] = [];

    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
            results.push(...findLockFiles(fullPath, filename));
        } else if (entry.name === filename) {
            results.push(fullPath);
        }
    }

    return results;
}

type EXTENDED_LOCKFILE = KONBINI_LOCKFILE & { path: string };

export async function listPackages(
    verbosity: "VERBOSE" | "STANDARD" | "SILENT",
): Promise<EXTENDED_LOCKFILE[]> {
    const lockfiles = findLockFiles(PACKAGES_DIR);
    const pkgsToList: EXTENDED_LOCKFILE[] = [];

    for (const lockfile of lockfiles) {
        const parsed = parse(readFileSync(lockfile, { encoding: "utf-8" }));
        const exists = await packageExists(parsed.pkg).catch(() => false);
        if (!exists && parsed.scope !== "KPAK") {
            konsole.dbg("Asserted", parsed.pkg, "no longer is installed. Removed its lockfile.");
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
        const stuff = [
            pkg.pkg,
            konsole.clr("grey", "from"),
            konsole.clr(
                "cyan",
                (pkg.scope as any) === "KPAK" ? "a local Konpak" : parseKps(pkg.scope).name,
            ),
            konsole.clr("white", "|"),
            konsole.clr("grey", "installed"),
            konsole.clr("plum", new Date(pkg.timestamp).toUTCString()),
        ];
        if (isKbiScope(pkg.scope) && (pkg as any).version) {
            stuff.push(
                konsole.clr("white", "|"),
                konsole.clr("grey", "version"),
                konsole.clr("cyan", (pkg as any).version),
            );
        }
        konsole.suc(...stuff);
        if (verbosity === "VERBOSE") {
            konsole.adv("PATH", konsole.clr("brown", pkg.path));
            konsole.adv(
                "SHA512",
                konsole.clr(
                    "red",
                    (pkg.scope as any) === "KPAK"
                        ? "None. Installed from a local Konpak."
                        : isKbiScope(pkg.scope)
                          ? (pkg as any).installation_hash
                          : "None. Installed from an aliased pkg manager.",
                ),
            );
        }
    }

    return pkgsToList.sort();
}
