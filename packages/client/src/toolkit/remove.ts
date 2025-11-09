import { rmSync, readFileSync } from "fs";
import { join } from "path";
import { LAUNCHPAD_FILE_PATH, PKG_PATH } from "shared/client";
import { konsole } from "shared/client";
import { execSync } from "child_process";
import { ALIASED_CMDs } from "./alias-cmds";
import { getPkgManifest, parseID } from "shared/api/core";
import { parseKps } from "shared/api/manifest";
import { FILENAMES } from "shared/constants";
import { isKbiLockfile, type KONBINI_LOCKFILE } from "shared/types/files";
import { logAction } from "shared/api/kdata";
import { getLocalPackages } from "../commands/list";

export async function removePackage(pkg: string) {
    const pkgToRemove = getLocalPackages().find((p) => p.pkg_id === pkg);

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
    const removePath = PKG_PATH({ pkg, author: m.author });
    const lockfile: KONBINI_LOCKFILE = Bun.YAML.parse(
        readFileSync(join(removePath, FILENAMES.lockfile), { encoding: "utf-8" }),
    ) as any;
    const kps = parseKps(lockfile.scope);
    if (kps.src !== "kbi") {
        konsole.dbg(
            `Invoking aliased uninstallation command (${ALIASED_CMDs[kps.src]["uninstall"](kps.value)}).`,
        );
        execSync(ALIASED_CMDs[kps.src]["uninstall"](kps.value));
    }
    konsole.dbg(`Removing ${removePath}.`);
    rmSync(removePath, { force: true, recursive: true });
    rmSync(LAUNCHPAD_FILE_PATH({ pkg: parseID(pkg).package!, author: m.author }), {
        force: true,
        recursive: true,
    });

    await logAction({
        app: pkg,
        version: isKbiLockfile(lockfile) ? lockfile.version : "(alias)",
        action: "remove",
    });

    konsole.suc(`Successfully said goodbye to ${pkg}.`);
}

export function destroyPkg(path: string) {
    konsole.err(`DESTROYING package at ${path}`);
    rmSync(path, { force: true, recursive: true });
}
