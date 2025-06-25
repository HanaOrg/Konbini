import { readdirSync, statSync, rmSync, readFileSync } from "fs";
import { join } from "path";
import { INSTALL_DIR, PKG_PATH } from "../constants";
import { konsole } from "./konsole";
import { FILENAMES, getPkgManifest, parseKps, type KONBINI_LOCKFILE } from "shared";
import { parse } from "yaml";
import { execSync } from "child_process";
import { ALIASED_CMDs } from "./alias-cmds";

function findPackage(pkg: string): string | null {
    for (const entry of readdirSync(INSTALL_DIR)) {
        const fullPath = join(INSTALL_DIR, entry);
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

    const { author_id: author } = await getPkgManifest(pkg);
    konsole.suc("At your orders. Consider them out.");
    const removePath = PKG_PATH({ pkg, author });
    const lockfile: KONBINI_LOCKFILE = parse(
        readFileSync(join(removePath, FILENAMES.lockfile), { encoding: "utf-8" }),
    );
    const kps = parseKps(lockfile.scope);
    if (kps.src !== "std") {
        konsole.dbg(`Invoking aliased (${kps.cmd}) uninstallation command.`);
        execSync(ALIASED_CMDs[kps.src]["uninstall"](lockfile.pkg));
    }
    konsole.dbg(`Applying rm -rf at ${removePath}.`);
    rmSync(removePath, { force: true, recursive: true });
    konsole.suc(`Successfully said goodbye to ${pkg}.`);
}

export function destroyPkg(path: string) {
    konsole.err(`DESTROYING package at ${path}`);
    rmSync(path, { force: true, recursive: true });
}
