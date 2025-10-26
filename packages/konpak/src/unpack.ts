import AdmZip from "adm-zip";
import { existsSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "fs";
import { IntegrateApp, type WindowsParams } from "./integrate";
import { PKG_PATH } from "shared/client";
import type { KONBINI_MANIFEST } from "shared/types/manifest";
import { join } from "path";
import { toUpperCaseFirst } from "@zakahacecosas/string-utils";
import type { KONBINI_LOCKFILE } from "shared/types/files";
import { FILENAMES } from "shared/constants";
import { KPAK_INT_FILENAMES } from "..";

export function Unpack(filepath: Buffer): void;
export function Unpack(filepath: string): void;
export function Unpack(filepath: string | Buffer): void {
    if (typeof filepath === "string" && !existsSync(filepath))
        throw new Error("Specified filepath does not exist.");
    const bin = typeof filepath === "string" ? readFileSync(filepath) : filepath;
    const header = bin.subarray(0, 14).toString("ascii");
    if (header !== "KPAK__SIGNALER")
        throw new Error(`Not a KPAK. Header '${header}' (ASCII)(0:14) is not a proper signaler.`);
    const buff = bin.subarray(14);
    const zip = new AdmZip(buff);

    const _manifest = zip.getEntry("manifest.yaml");
    if (!_manifest) throw new Error("Konpak lacks manifest!");
    const _appId = zip.getEntries().find((e) => e.name.startsWith(KPAK_INT_FILENAMES.ID));
    if (!_appId) throw new Error("Konpak lacks app ID signaler file.");
    const appId = _appId.getData().toString("utf-8");
    const _appPt = zip.getEntries().find((e) => e.name.startsWith(KPAK_INT_FILENAMES.PT));
    if (!_appPt) throw new Error("Konpak lacks platform signaler file.");
    const platform = _appPt.getData().toString("utf-8");
    const _appVr = zip.getEntries().find((e) => e.name.startsWith(KPAK_INT_FILENAMES.VR));
    if (!_appVr) throw new Error("Konpak lacks version signaler file.");
    const version = _appVr.getData().toString("utf-8");

    const manifest: KONBINI_MANIFEST = Bun.YAML.parse(_manifest.getData().toString("utf-8")) as any;

    const out = PKG_PATH({ pkg: appId, author: manifest.author });

    zip.extractAllTo(out, true);

    rmSync(join(out, KPAK_INT_FILENAMES.ID));
    rmSync(join(out, KPAK_INT_FILENAMES.VR));
    rmSync(join(out, KPAK_INT_FILENAMES.PT));
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
        publisher: manifest.author,
        manifest,
    };

    const installPath = PKG_PATH({
        pkg: appId,
        author: manifest.author,
    });

    if (platform === "linux") {
        IntegrateApp({
            ...wParams,
            installPath,
            // in case "both", we can assume the user prefers a GUI
            // otherwise they wouldn't click a UI icon
            // thus check just for "cli"
            isCli: manifest.type === "cli",
            comment: manifest.slogan,
            categories: (manifest.categories || [])
                .map(String.prototype.toLowerCase)
                .map(toUpperCaseFirst)
                .join(","),
        });
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
        join(out, FILENAMES.lockfile),
        `# NOTE: This was installed from a Konpak. We cannot trace if it comes from Konbini or from a bare file, so this scope has a small chance of pointing to nowhere.\n${Bun.YAML.stringify(lock)}`,
    );
}
