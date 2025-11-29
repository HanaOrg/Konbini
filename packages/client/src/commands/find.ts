import { execSync } from "child_process";
import { ALIASED_CMDs } from "../toolkit/alias-cmds";
import { konsole } from "shared/client";
import { normalize } from "strings-utils";
import { writeLockfile } from "../toolkit/write";
import { getPkgManifest } from "shared/api/core";
import type { KONBINI_ID_PKG } from "shared/types/author";
import { getPlatform } from "shared/api/platform";
import { listPackages } from "./list";

export async function find() {
    konsole.war("As of now this only works with Flatpak.");
    konsole.adv("Loading...");
    const remoteList: string[] = await (
        await fetch("https://konbini-data.vercel.app/api/names")
    ).json();
    const _localList = execSync(ALIASED_CMDs.fpak.list!).toString();
    const localList = _localList
        .split("\n")
        .slice(1)
        .map((s) => normalize(s).split(" "));
    const actualLocalList = listPackages("SILENT");

    for (const i of localList) {
        if (!remoteList.includes(i[0]!)) {
            konsole.dbg(`Flatpak ${i[0]} isn't on Konbini yet, skipping it for now.`);
        } else {
            if (actualLocalList.map((i) => i.pkg_id).includes(i[0]! as any)) {
                konsole.dbg(`Flatpak ${i[0]} is on Konbini and is already registered.`);
            } else {
                konsole.adv(`Flatpak ${i[0]} is on Konbini! Registering...`);
                const manifest = await getPkgManifest(i[0]!);
                writeLockfile(
                    {
                        version: i[1]!,
                        pkg_id: i[0]! as KONBINI_ID_PKG,
                        timestamp: Date.now(),
                        scope: manifest.platforms[getPlatform()]!,
                        remote_url: "Installed directly from package manager",
                        installation_hash: "None, installed directly from package manager",
                    },
                    i[0]!,
                    manifest.author,
                );
                konsole.suc(
                    `Registered ${i[0]}! Note that the install date will show up as today.`,
                );
            }
        }
    }
}
