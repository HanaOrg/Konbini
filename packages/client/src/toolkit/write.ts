import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { USR_PATH, PKG_PATH, LAUNCHPAD_FILE_PATH, konsole } from "shared/client";
import { FILENAMES } from "shared/constants";
import type { KONBINI_LOCKFILE } from "shared/types/files";
import type { KONBINI_ID_PKG, KONBINI_ID_USR } from "shared/types/author";
import { getPlatform } from "shared/api/platform";
import type { KONBINI_PKG_SCOPE } from "shared/types/manifest";
import { parseID } from "shared/api/core";
import { parseKps } from "shared/api/manifest";

export function writeLockfile(lockfile: KONBINI_LOCKFILE, pkg: string, author: KONBINI_ID_USR) {
    const usrDir = USR_PATH({ author });
    const pkgDir = PKG_PATH({ pkg, author });

    if (!existsSync(usrDir)) mkdirSync(usrDir);
    if (!existsSync(pkgDir)) mkdirSync(pkgDir);

    writeFileSync(join(pkgDir, FILENAMES.lockfile), Bun.YAML.stringify(lockfile, null, 4), {
        flag: "w",
    });
}

export function writeLaunchpadShortcut(
    pkgId: KONBINI_ID_PKG,
    author: KONBINI_ID_USR,
    outputPath: string,
    aliasing: KONBINI_PKG_SCOPE | null,
) {
    const pkg = parseID(pkgId).package;
    if (!pkg) throw `Cannot create launchpad shortcut for invalid PKG ID ${pkgId}`;
    const scope = aliasing === null ? { src: "_", value: "_" } : parseKps(aliasing);
    // everyone references the package directly ("apt install foo" -> run "foo")
    // except for flatpak where "flatpak install foo" -> run "flatpak run foo"
    // so yeah we need this
    const alias = scope.src === "fpak" ? `flatpak run ${scope.value}` : outputPath;
    // when using this function on aliased packages that aren't from flatpak, pass an ""
    if (alias === "") return;
    writeFileSync(
        LAUNCHPAD_FILE_PATH({
            pkg,
            author,
        }),
        getPlatform() === "win64" ? `${alias} $args` : `#!/usr/bin/env bash\n${alias} $@`,
        { flag: "w", encoding: "utf-8" },
    );
    konsole.dbg(`Launchpad shortcut written. Run '${pkg}' to use your newly installed package.`);
}
