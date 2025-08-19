import {
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    renameSync,
    writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { Konpak } from "../../../konpak/src/pack";
import { toUpperCaseFirst, validate, validateAgainst } from "@zakahacecosas/string-utils";
import { konsole } from "shared/client";
import { cwd } from "node:process";
import { getKonpakSfx } from "../../../konpak/src/sfx";

export async function konpakFromDir(
    dir: string,
    platform: string | undefined,
    appId: string | undefined,
    binary: string | undefined,
    version: string | undefined,
    icon: string | undefined,
    useSfx: boolean | undefined,
) {
    if (!existsSync(dir)) throw `Directory ${dir} does not exist.`;

    if (!validateAgainst(platform, ["windows", "linux"]))
        throw "Invalid platform. Either 'windows' or 'linux'. Provide it with --platform=[windows | linux].";
    if (!validate(appId)) throw "No app ID provided. Provide it with --id=[...].";
    if (!validate(binary)) throw "No binary provided. Provide the FILENAME with --binary=[...].";
    if (!validate(icon)) throw "No icon provided. Provide the FILENAME with --icon=[...].";
    if (!validate(version)) throw "No version provided. Provide it with --ver=[...].";

    const pathToManifest = join(dir, "manifest.yaml");
    const pathToBinary = join(dir, binary);
    const pathToIcon = join(dir, icon);
    const pathToDirected = join(dir, "directed");

    if (![pathToManifest, pathToBinary, pathToIcon].every((p) => existsSync(p)))
        throw "Some required files don't exist. Check that a manifest.yaml and the given binary and icon exist.";

    if (!existsSync(pathToDirected)) mkdirSync(pathToDirected);

    for (const file of readdirSync(dir)) {
        if (["manifest.yaml", binary, icon, "directed"].includes(file)) continue;
        const src = join(dir, file);
        const dst = join(pathToDirected, file);
        renameSync(src, dst);
    }

    konsole.dbg(`Konpaking ver ${version} of ${appId} for ${toUpperCaseFirst(platform)}...`);

    Konpak({
        appId,
        version,
        platform,
        pathToIcon,
        pathToBinary,
        pathToManifest,
        pathToDirected,
    });

    const path = join(cwd(), `${appId}.kpak`);

    konsole.suc(`Konpak'd ${appId} successfully! Find it at ${path}.`);
    const sfx = useSfx
        ? true
        : konsole.ask(
              "Turn it into a self-extracting Konpak?\nThis gives you a more versatile installer than users can execute directly, similar to an installer.\nThis advantage comes at the cost of an extra 100 MB.",
          );

    if (sfx) {
        const sfx = await getKonpakSfx(platform);
        if (!sfx) {
            konsole.err("KPAK SFX not downloaded.");
            return;
        }
        writeFileSync(
            platform === "windows" ? path + ".exe" : path,
            Buffer.concat([sfx, readFileSync(path)]),
        );
        konsole.suc(
            `Your Konpak is ready for universal ${toUpperCaseFirst(platform)} distribution.`,
        );
    } else {
        konsole.suc("Got it. Your Konpak is ready for Konbini-only distribution.");
    }
}
