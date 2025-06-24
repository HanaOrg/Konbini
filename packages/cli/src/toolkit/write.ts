import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { stringify } from "yaml";
import { USR_PATH, PKG_PATH, LAUNCHPAD_DIR, LAUNCHPAD_FILE_PATH } from "../constants";
import { type KONBINI_LOCKFILE, type KONBINI_AUTHOR_ID, FILENAMES, getPlatform } from "shared";

export function writeLockfile(lockfile: KONBINI_LOCKFILE, pkg: string, author: KONBINI_AUTHOR_ID) {
    const usrDir = USR_PATH({ author });
    const pkgDir = PKG_PATH({ pkg, author });

    if (!existsSync(usrDir)) mkdirSync(usrDir);
    if (!existsSync(pkgDir)) mkdirSync(pkgDir);

    writeFileSync(
        join(pkgDir, FILENAMES.lockfile),
        stringify(lockfile, {
            indent: 4,
        }),
        { flag: "w" },
    );
}

export function writeLaunchpadShortcut(pkg: string, author: KONBINI_AUTHOR_ID, outputPath: string) {
    if (!existsSync(LAUNCHPAD_DIR)) mkdirSync(LAUNCHPAD_DIR);
    writeFileSync(
        LAUNCHPAD_FILE_PATH({
            pkg,
            author,
        }),
        getPlatform() === "win64" ? `${outputPath} $args` : `#!/usr/bin/env bash\n${outputPath} $@`,
        { flag: "w", encoding: "utf-8" },
    );
}
