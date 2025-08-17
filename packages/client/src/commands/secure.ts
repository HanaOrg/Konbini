import { konsole, LAUNCHPAD_FILE_PATH } from "shared/client";
import { listPackages } from "./list";
import { fetchAPI } from "shared/api/network";
import type { KONBINI_ID_PKG } from "shared/types/author";
import type { SUPPORTED_PLATFORMS } from "shared/types/manifest";
import { removePackage } from "../toolkit/remove";
import { writeFileSync } from "fs";

export async function ensureSecurity() {
    konsole.dbg("UPDATING SECURITY INFO");
    const pkgs = (await listPackages("SILENT")).map((p) => p.pkg);

    for (const pkg of pkgs) {
        const res = await fetchAPI(`https://konbini-data.vercel.app/api/guard?id=${pkg}`);
        const data: {
            date: string;
            results: `${KONBINI_ID_PKG}@${string}@${SUPPORTED_PLATFORMS}=${"SAFE" | "UNSAFE"}|${"AUTHENTIC" | "UNAUTHENTIC"}|${"INTEGRAL" | "CORRUPTED"}`[];
        } = await res.json();

        for (const result of data.results) {
            const split = result.split("@")[2]!.split("=");
            const results = split[1]!.split("|");

            if (
                !(
                    results.includes("UNSAFE") ||
                    results.includes("UNAUTHENTIC") ||
                    results.includes("CORRUPTED")
                )
            ) {
                konsole.dbg("PACKAGE", pkg, "IS SECURE, NO ACTION TAKEN");
                continue;
            }

            konsole.err("PACKAGE", pkg, "IS INSECURE, REMOVING");
            await removePackage(pkg);
            // echo works on both PS1 and SH so yeah
            writeFileSync(
                LAUNCHPAD_FILE_PATH({ pkg, author: pkg.split(".").splice(0, 2).join(".") }),
                `echo 'The package ${pkg} was found to be insecure (based on latest scan, ${data.date.split("|")[1]!.trim()}). Because of this, we removed it from your local system to attempt to prevent any damages. Sorry.\nPlease scan your computer and ensure no suspicious behavior exists.'`,
            );
        }
    }
}
