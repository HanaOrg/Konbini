import AdmZip from "adm-zip";
import { existsSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "fs";
import { IntegrateApp, type LinuxParams, type WindowsParams } from "./integrate";
import { parse, stringify } from "yaml";
import { PKG_PATH } from "shared/client";
import type { KONBINI_MANIFEST } from "shared/types/manifest";
import { join } from "path";
import { toUpperCaseFirst } from "@zakahacecosas/string-utils";
import type { KONBINI_LOCKFILE } from "shared/types/files";

export function Unpack(filepath: Buffer): void;
export function Unpack(filepath: string): void;
export function Unpack(filepath: string | Buffer): void {
    if (typeof filepath === "string" && !existsSync(filepath))
        throw new Error("Specified filepath does not exist.");
    const bin = typeof filepath === "string" ? readFileSync(filepath) : filepath;
    const header = bin.slice(0, 14).toString("ascii");
    if (header !== "KPAK__SIGNALER")
        throw new Error(`Not a KPAK. Header is '${header}' (ASCII), should be a proper signaler.`);
    const buff = bin.slice(14);
    writeFileSync("./test-buff.zip", buff);
    const zip = new AdmZip(buff);

    const _manifest = zip.getEntry("manifest.yaml");
    if (!_manifest) throw new Error("Konpak lacks manifest!");
    const _appId = zip.getEntries().find((e) => e.name.startsWith("appID"));
    if (!_appId) throw new Error("Konpak lacks app ID signaler file.");
    const appId = _appId.name.replace("appID", "");
    const _appPt = zip.getEntries().find((e) => e.name.startsWith("appPT"));
    if (!_appPt) throw new Error("Konpak lacks platform signaler file.");
    const platform = _appPt.name.replace("appPT", "");
    const _appVr = zip.getEntries().find((e) => e.name.startsWith("appVR"));
    if (!_appVr) throw new Error("Konpak lacks version signaler file.");
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

    const lock: KONBINI_LOCKFILE = {
        pkg: appId,
        timestamp: new Date().toString(),
        // @ts-expect-error uhm if we change the type to be `kbi:${string}` | "KPAK" too much errors...
        scope: `KPAK`,
        version,
        remote_url: "KPAK",
        installation_hash: "KPAK",
    };

    writeFileSync(
        join(out, "konbini.lockfile.yaml"),
        `# NOTE: This was installed from a Konpak. We cannot trace if it comes from Konbini or from a bare file, so this scope has a small chance of pointing to nowhere.\n${stringify(lock)}`,
    );
}
