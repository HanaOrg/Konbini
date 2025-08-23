import { konsole, LAUNCHPAD_FILE_PATH } from "shared/client";
import { listPackages } from "./list";
import { removePackage } from "../toolkit/remove";
import { writeFileSync } from "fs";
import { scanPackage } from "shared/api/kdata";
import type { KONBINI_ID_PKG } from "shared/types/author";

export async function ensureSecurity() {
    konsole.dbg("UPDATING SECURITY INFO");
    const pkgs = listPackages("SILENT").map((p) => p.pkg_id);

    for (const pkg of pkgs) {
        const isSecure = await scanPackage(pkg as KONBINI_ID_PKG, false);

        if (isSecure) {
            konsole.dbg("PACKAGE", pkg, "IS SECURE, NO ACTION TAKEN");
            continue;
        }

        konsole.err("PACKAGE", pkg, "IS INSECURE, REMOVING");
        await removePackage(pkg);
        // echo works on both PS1 and SH so yeah
        writeFileSync(
            LAUNCHPAD_FILE_PATH({ pkg, author: pkg.split(".").splice(0, 2).join(".") }),
            `echo 'The package ${pkg} was recently reported as insecure. Because of this, we removed it from your local system to attempt to prevent any damages. Sorry.\nPlease scan your computer and ensure no suspicious behavior exists.'`,
        );
    }
}
