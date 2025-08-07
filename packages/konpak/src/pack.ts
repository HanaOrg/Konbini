import { readFileSync, rmSync, writeFileSync } from "fs";
import AdmZip from "adm-zip";
import { extname } from "path";

export function Konpak(p: {
    appId: string;
    version: string;
    platform: "windows" | "linux";
    pathToIcon: string;
    pathToBinary: string;
    pathToManifest: string;
    pathToDirected: string | null;
}) {
    const { appId, version, platform, pathToIcon, pathToBinary, pathToManifest, pathToDirected } =
        p;
    const arch = new AdmZip();

    const man = readFileSync(pathToManifest).buffer;

    if (pathToDirected) {
        arch.addFile("d/", Buffer.from([]));
        arch.addLocalFolder(pathToDirected, "d/");
    }

    arch.addFile("manifest.yaml", Buffer.from(man));

    arch.addFile(appId + extname(pathToBinary), Buffer.from(readFileSync(pathToBinary).buffer));

    arch.addFile(
        appId + (platform === "windows" ? ".ico" : ".png"),
        Buffer.from(readFileSync(pathToIcon).buffer),
    );

    arch.addFile("appPT" + platform, Buffer.from("never gonna give you up"));
    arch.addFile("appID" + appId, Buffer.from("never gonna let you down"));
    arch.addFile("appVR" + version, Buffer.from("never gonna run around and desert you"));

    arch.writeZip(`./${appId}.kpak.zip`);

    const bin = readFileSync(`./${appId}.kpak.zip`);

    writeFileSync(`./${appId}.kpak`, Buffer.concat([Buffer.from("KPAK__SIGNALER"), bin]));

    rmSync(`./${appId}.kpak.zip`);
}
