import { INSTALLATION_DIR, konsole } from "shared/client";
import { join } from "path";
import { existsSync, readFileSync } from "fs";
import type { RELEASE_GH_CB } from "shared/types/git";
import { getPlatform } from "shared/api/platform";
import { downloadHandler } from "shared/api/download";

/** Get the Konpak SelF eXtractable (SFX).
 * Returns its contents. If absent, prompts to download it.
 */
export async function getKonpakSfx(): Promise<Buffer | null> {
    const filePath = join(INSTALLATION_DIR, "kpak-sfx");

    if (existsSync(filePath)) return readFileSync(filePath);

    konsole.war("KPAK SFX module not installed (required for making self-extract Konpaks).");
    const download = konsole.ask("Download it? It's around 100 MB.");
    if (!download) return null;

    const response = await fetch(
        `https://api.github.com/repos/FuckingNode/FuckingNode/releases/latest`,
    );
    const data: RELEASE_GH_CB = await response.json();
    const remoteUrl = data.assets.find((s) =>
        s.name.startsWith(`kpak-sfx-${getPlatform()}`),
    )?.browser_download_url;

    if (!remoteUrl)
        throw "Error: Couldn't find asset URL. This is probably our fault, please file an issue.";

    const result = await downloadHandler({ remoteUrl, filePath });

    if (result === "TimeOut") throw "Download timed out.";

    return readFileSync(filePath);
}
