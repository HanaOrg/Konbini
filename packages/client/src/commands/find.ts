import { execSync } from "child_process";
import { ALIASED_CMDs } from "../toolkit/alias-cmds";
import { konsole } from "shared/client";
import { normalize } from "strings-utils";
import { writeLockfile } from "../toolkit/write";
import { getPkgManifest } from "shared/api/core";
import type { KONBINI_ID_PKG } from "shared/types/author";
import { getPlatform } from "shared/api/platform";
import { listPackages } from "./list";
import { logAction } from "shared/api/kdata";
import type { KONBINI_PKG_SCOPE } from "shared/types/manifest";
import type { KDATA_ENTRY_PKG } from "shared/types/kdata";

export async function find() {
    konsole.war("As of now this only works with Flatpak, Homebrew, and Snap.");
    konsole.adv("Loading...");
    const remoteList: Record<KONBINI_ID_PKG, KONBINI_PKG_SCOPE | null> = Object.fromEntries(
        Object.values(
            (await (
                await fetch("https://konbini-data.vercel.app/api/group?sorting=d")
            ).json()) as Record<KONBINI_ID_PKG, KDATA_ENTRY_PKG>,
        ).map((i) => {
            return [i.id, i.platforms[getPlatform()]];
        }),
    );
    const _localList =
        execSync(ALIASED_CMDs.fpak.list!).toString() +
        "\n" +
        execSync(ALIASED_CMDs.brew.list!) +
        "\n" +
        execSync(ALIASED_CMDs.snap.list!).toString().split("\n").slice(1).join("\n");
    const localList = _localList
        .split("\n")
        .slice(1)
        .map((s) => normalize(s, { preserveCase: true }).split(" ").slice(0, 2));
    const actualLocalList = listPackages("SILENT");
    const K = Object.values(remoteList)
        .filter(Boolean)
        .map((s) => s!.split(":")[1]);

    for (const i of localList) {
        if (!K.includes(i[0]!)) {
            konsole.dbg(`Package ${i[0]} isn't on Konbini yet, skipping it for now.`);
        } else {
            if (actualLocalList.map((i) => i.pkg_id).includes(i[0]! as any)) {
                konsole.dbg(`Package ${i[0]} is on Konbini and is already registered.`);
            } else {
                konsole.adv(`Package ${i[0]} is on Konbini! Registering...`);
                const id: KONBINI_ID_PKG | undefined = Object.entries(remoteList).find(
                    ([_, v]) => v && v.split(":")[1] == i[0]!,
                )?.[0] as KONBINI_ID_PKG | undefined;
                if (!id) throw `Package ${i} doesn't have a proper ID?`;
                const manifest = await getPkgManifest(id);
                writeLockfile(
                    {
                        version: i[1]!,
                        pkg_id: id,
                        timestamp: Date.now(),
                        scope: manifest.platforms[getPlatform()]!,
                        remote_url: "Installed directly from package manager",
                        installation_hash: "None, installed directly from package manager",
                    },
                    i[0]!,
                    manifest.author,
                );
                const res = await logAction({
                    app: i[0]!,
                    version: i[1]!,
                    action: "download",
                });
                console.debug(await res.json());
                konsole.suc(
                    `Registered ${i[0]}! Note that the install date will show up as today.`,
                );
            }
        }
    }
}
