import AdmZip from "adm-zip";
import { readFileSync, rmSync } from "fs";
import { debug } from "../index";
import { IntegrateApp, type LinuxParams, type WindowsParams } from "./integrate";
import { parse } from "yaml";
import { PKG_PATH } from "shared/client";
import type { KONBINI_MANIFEST } from "shared/types/manifest";
import { join } from "path";

export function Unpack(filepath: string) {
    const bin = readFileSync(filepath);
    const h = bin.slice(0, 4).toString();
    if (h !== "KPAK") throw new Error("Not a KPAK.");
    const buff = bin.slice(4);
    const zip = new AdmZip(buff);

    zip.getEntries().map((e) => {
        debug(e.entryName, e.isDirectory ? "DIR" : "FILE");
    });

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

    zip.extractAllTo(out);

    rmSync(join(out, "appID" + appId));
    rmSync(join(out, "appVR" + version));
    rmSync(join(out, "appPT" + platform));

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
            // TODO: use actual value
            isCli: false,
            // TODO: use actual value
            comment: "",
            // TODO: use actual value
            categories: "",
        };
        IntegrateApp(lParams);
    } else {
        IntegrateApp({ ...wParams, installPath });
    }
}
