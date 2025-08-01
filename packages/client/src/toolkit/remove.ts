import { readdirSync, statSync, rmSync, readFileSync } from "fs";
import { join } from "path";
import { PACKAGES_DIR, PKG_PATH } from "shared/client";
import { konsole } from "shared/client";
import { parse } from "yaml";
import { execSync } from "child_process";
import { ALIASED_CMDs } from "./alias-cmds";
import { getPkgManifest } from "shared/api/core";
import { parseKps } from "shared/api/manifest";
import { FILENAMES } from "shared/constants";
import type { KONBINI_LOCKFILE } from "shared/types/files";
import { logAction } from "shared/api/telemetry";
import { getPkgRemotes } from "shared/api/getters";
import { getPlatform } from "shared/api/platform";

function findPackage(pkg: string): string | null {
    for (const entry of readdirSync(PACKAGES_DIR)) {
        const fullPath = join(PACKAGES_DIR, entry);
        const stats = statSync(fullPath);

        if (stats.isDirectory() && fullPath.endsWith(pkg)) {
            return fullPath;
        }
    }
    return null;
}

export async function removePackage(pkg: string) {
    const pkgToRemove = findPackage(pkg);

    if (!pkgToRemove) {
        konsole.err(`There's NOT such thing as ${pkg} installed here.`);
        return;
    }

    if (!konsole.ask(`Are you sure you wish to remove ${pkg}?`)) {
        konsole.suc("At your orders. They're staying here.");
        return;
    }

    const m = await getPkgManifest(pkg);
    konsole.suc("At your orders. Consider them out.");
    const removePath = PKG_PATH({ pkg, author: m.author_id });
    const lockfile: KONBINI_LOCKFILE = parse(
        readFileSync(join(removePath, FILENAMES.lockfile), { encoding: "utf-8" }),
    );
    const kps = parseKps(lockfile.scope);
    if (kps.src !== "kbi") {
        konsole.dbg(`Invoking aliased (${kps.cmd}) uninstallation command.`);
        execSync(ALIASED_CMDs[kps.src]["uninstall"](lockfile.pkg));
    }
    konsole.dbg(`Applying rm -rf at ${removePath}.`);
    rmSync(removePath, { force: true, recursive: true });

    await logAction({
        app: pkg,
        version: (await getPkgRemotes(m.platforms[getPlatform()]!, m)).pkgVersion,
        action: "remove",
    });

    konsole.suc(`Successfully said goodbye to ${pkg}.`);
}

export function destroyPkg(path: string) {
    konsole.err(`DESTROYING package at ${path}`);
    rmSync(path, { force: true, recursive: true });
}
