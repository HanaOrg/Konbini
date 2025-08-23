import { INSTALLATION_DIR, konsole } from "shared/client";
import { version as kVersion } from "../../../client/package.json";
import { join } from "path";
import { getPlatform } from "shared/api/platform";
import type { RELEASE_GH_CB } from "shared/types/git";
import { fetchAPI } from "shared/api/network";
import { downloadHandler } from "shared/api/download";

export async function updateKonbini() {
    konsole.adv("You're currently on Konbini", kVersion);
    konsole.adv("Checking for updates...");

    const res: RELEASE_GH_CB = await (
        await fetchAPI("https://api.github.com/repos/HanaOrg/Konbini/releases/latest")
    ).json();

    if (!res)
        throw `There's no latest release. Check our repository and file an issue, this is probably a mistake from us.`;

    if (Bun.semver.order(res.tag_name, kVersion) !== 1) {
        konsole.suc("You're up to date!");
        return;
    }

    konsole.out(
        `You're on an outdated (${kVersion}) version! Latest is ${res.tag_name}, updating now...`,
    );

    const plat = getPlatform();
    const asset = res.assets.find((a) => a.name === `kbi-${plat}${plat === "win64" ? ".exe" : ""}`);

    if (!asset)
        throw "No executable for your platform. This is likely our fault for messing up somewhere when releasing our last update, please notify us.";

    await downloadHandler({
        remoteUrl: asset.browser_download_url,
        filePath: join(INSTALLATION_DIR, plat === "win64" ? "kbi.exe" : "kbi"),
    });

    konsole.suc("There we go! Updated to", res.tag_name);
}
