import { join } from "path";
import { USR_PATH, PKG_PATH, FILENAMES, LAUNCHPAD_DIR, LAUNCHPAD_FILE_PATH } from "../constants";
import type { AUTHOR_ID } from "../types/author";
import type { KONBINI_PKG_LOCKFILE } from "../types/lockfile";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { stringify } from "yaml";
import { getPlatform } from "./platform";

export function writeLockfile(lockfile: KONBINI_PKG_LOCKFILE, pkg: string, author: AUTHOR_ID) {
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

export function writeLaunchpadShortcut(pkg: string, author: AUTHOR_ID, outputPath: string) {
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
