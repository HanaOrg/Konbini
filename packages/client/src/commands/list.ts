import { readdirSync, readFileSync, rmSync } from "fs";
import { join } from "path";
import { PACKAGES_DIR } from "shared/client";
import { konsole } from "shared/client";
import { packageExists } from "../toolkit/aliased";
import { FILENAMES } from "shared/constants";
import type { KONBINI_LOCKFILE } from "shared/types/files";
import { parseKps } from "shared/api/manifest";
import { isKbiScope } from "../../../shared/types/manifest";
import { parseID } from "shared/api/core";
import type { KONBINI_ID_PKG } from "shared/types/author";

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

export function getLocalPackages(): EXTENDED_LOCKFILE[] {
    return findLockFiles(PACKAGES_DIR).map((result) => {
        const lockfile = Bun.YAML.parse(readFileSync(result, { encoding: "utf-8" }));
        if (typeof lockfile !== "object") throw `Invalid lockfile.`;
        return {
            ...lockfile,
            path: result,
        } as EXTENDED_LOCKFILE;
    });
}

type EXTENDED_LOCKFILE = KONBINI_LOCKFILE & { path: string };

export function listPackages(verbosity: "VERBOSE" | "STANDARD" | "SILENT"): EXTENDED_LOCKFILE[] {
    const lockfiles = getLocalPackages();
    const pkgsToList: EXTENDED_LOCKFILE[] = [];

    for (const lockfile of lockfiles) {
        try {
            const user_id = lockfile.pkg_id.startsWith("kbi.grabbed")
                ? (lockfile.pkg_id.split(".").slice(2).join(".") as KONBINI_ID_PKG)
                : parseID(lockfile.pkg_id).user_id;
            const exists = packageExists(lockfile.scope, user_id);
            // @ts-expect-error "KPAK" is a valid scope but it's not properly typed...
            if (!exists && lockfile.scope !== "KPAK") {
                konsole.dbg(
                    "Asserted",
                    lockfile.pkg_id,
                    "no longer is installed. Removed its lockfile.",
                );
                rmSync(join(lockfile.path, "../"), { recursive: true, force: true });
            } else {
                pkgsToList.push(lockfile);
            }
        } catch (error) {
            konsole.dbg("Failed to list an item because of error:", error);
            continue;
        }
    }

    if (pkgsToList.length === 0) {
        if (verbosity !== "SILENT") konsole.adv("No packages here, yet!");
        return [];
    }

    if (verbosity === "SILENT") return pkgsToList.sort();

    for (const pkg of pkgsToList) {
        const stuff = [
            pkg.pkg_id.replace("kbi.grabbed.", ""),
            konsole.clr(
                "grey",
                pkg.pkg_id.startsWith("kbi.grabbed.") ? "grabbed from" : "installed from",
            ),
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
        if (pkg.pkg_id.startsWith("kbi.grabbed.")) {
            konsole.war(
                `The above [${pkg.pkg_id}] is a grabbed package.\nShown package ID is the one from the store it comes from, not a Konbini one.`,
            );
        }
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
