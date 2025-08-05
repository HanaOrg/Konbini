import { existsSync, mkdirSync, readdirSync, renameSync } from "node:fs";
import { join } from "node:path";
import { Konpak } from "../../../konpak/src/pack";
import { validate, validateAgainst } from "@zakahacecosas/string-utils";

export function konpakFromDir(
    dir: string,
    platform: string | undefined,
    appId: string | undefined,
    binary: string | undefined,
    version: string | undefined,
    icon: string | undefined,
) {
    if (!existsSync(dir)) throw "Directory does not exist.";

    if (!validateAgainst(platform, ["windows", "linux"]))
        throw "Invalid platform. Either 'windows' or 'linux'. Provide it with --platform=[windows | linux].";
    if (!validate(appId)) throw "No app ID provided. Provide it with --id=[...].";
    if (!validate(binary)) throw "No binary provided. Provide the FILENAME with --binary=[...].";
    if (!validate(icon)) throw "No icon provided. Provide the FILENAME with --icon=[...].";
    if (!validate(version)) throw "No version provided. Provide it with --version=[...].";

    const pathToManifest = join(dir, "manifest.yaml");
    const pathToBinary = join(dir, binary);
    const pathToIcon = join(dir, icon);
    const pathToDirected = join(dir, "directed");

    if (![pathToManifest, pathToBinary, pathToIcon].every((p) => existsSync(p)))
        throw "Some required files don't exist.";

    if (!existsSync(pathToDirected)) mkdirSync(pathToDirected);

    for (const file of readdirSync(dir)) {
        if (["manifest.yaml", binary, icon, "directed"].includes(file)) continue;
        const src = join(dir, file);
        const dst = join(pathToDirected, file);
        renameSync(src, dst);
    }

    Konpak({
        appId,
        version,
        platform,
        pathToIcon,
        pathToBinary,
        pathToManifest,
        pathToDirected,
    });
}
