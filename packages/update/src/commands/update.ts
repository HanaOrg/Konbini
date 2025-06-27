import { konsole } from "shared/client";
import { version as kVersion } from "../../../client/package.json";
import { fetchAPI, type GRA_RELEASE } from "shared";

export async function updateKonbini() {
    konsole.adv("You're currently on Konbini", kVersion);
    konsole.adv("Checking for updates...");

    const res: GRA_RELEASE = await (
        await fetchAPI("https://api.github.com/repos/HanaOrg/Konbini/releases/latest")
    ).json();

    if (Bun.semver.order(res.tag_name, kVersion) !== 1) {
        konsole.suc("You're up to date!");
        return;
    }

    konsole.out(
        `You're on an outdated (${kVersion}) version! Latest is ${res.tag_name}, updating now...`,
    );

    // TODO - installer
}
