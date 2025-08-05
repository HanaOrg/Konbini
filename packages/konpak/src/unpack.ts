import AdmZip from "adm-zip";
import { readFileSync, readdirSync, renameSync, rmSync } from "fs";
import { IntegrateApp, type LinuxParams, type WindowsParams } from "./integrate";
import { parse } from "yaml";
import { PKG_PATH } from "shared/client";
import type { KONBINI_MANIFEST } from "shared/types/manifest";
import { join } from "path";
import { toUpperCaseFirst } from "@zakahacecosas/string-utils";

export function Unpack(filepath: string) {
    const bin = readFileSync(filepath);
    const h = bin.slice(0, 4).toString();
    if (h !== "KPAK") throw new Error("Not a KPAK.");
    const buff = bin.slice(4);
    const zip = new AdmZip(buff);

    const _manifest = zip.getEntry("manifest.yaml");
    if (!_manifest) throw new Error("KPAK lacks manifest!");
    const _appId = zip.getEntries().find((e) => e.name.startsWith("appID"));
    if (!_appId) throw new Error("KPAK lacks app ID signaler file.");
    const appId = _appId.name.replace("appID", "");
    const _appPt = zip.getEntries().find((e) => e.name.startsWith("appPT"));
    if (!_appPt) throw new Error("KPAK lacks platform signaler file.");
    const platform = _appPt.name.replace("appPT", "");
    const _appVr = zip.getEntries().find((e) => e.name.startsWith("appVR"));
    if (!_appVr) throw new Error("KPAK lacks version signaler file.");
    const version = _appVr.name.replace("appVR", "");

    const manifest: KONBINI_MANIFEST = parse(_manifest.getData().toString("utf-8"));

    const out = PKG_PATH({ pkg: appId, author: manifest.author_id });

    zip.extractAllTo(out, true);

    rmSync(join(out, "appID" + appId));
    rmSync(join(out, "appVR" + version));
    rmSync(join(out, "appPT" + platform));
    const directPath = join(out, "d");
    for (const file of readdirSync(directPath)) {
        const src = join(directPath, file);
        const dst = join(out, file);
        try {
            renameSync(src, dst);
        } catch (e) {
            throw new Error(`Error moving ${src} to ${dst}: ${e}`);
        }
    }

    rmSync(directPath, { force: true, recursive: true });

    const wParams: Omit<WindowsParams, "installPath"> = {
        appId,
        version,
        appName: manifest.name,
        publisher: manifest.author_id,
        manifest,
    };

    const installPath = PKG_PATH({
        pkg: appId,
        author: manifest.author_id,
    });

    if (platform === "linux") {
        const lParams: LinuxParams = {
            ...wParams,
            installPath,
            // in case "both", we can assume the user prefers a GUI
            // otherwise they wouldn't click a UI icon
            // thus check just for "cli"
            isCli: manifest.app_type === "cli",
            comment: manifest.slogan,
            categories: manifest.categories
                .map(String.prototype.toLowerCase)
                .map(toUpperCaseFirst)
                .join(","),
        };
        IntegrateApp(lParams);
    } else {
        IntegrateApp({ ...wParams, installPath });
    }
}
