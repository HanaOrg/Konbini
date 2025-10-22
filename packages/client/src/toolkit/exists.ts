import { execSync } from "child_process";
import { getPlatform } from "shared/api/platform";
import type { SUPPORTED_PKG_MGR_CMD } from "shared/types/manifest";

/** Checks if anything is locally installed (and invocable via PATH). */
export function exists(what: SUPPORTED_PKG_MGR_CMD): boolean {
    const cmd = getPlatform() === "win64" ? `powershell where.exe ${what}` : `command -v ${what}`;
    console.log(what);
    try {
        // OPTION A (default)
        execSync(cmd, { stdio: "ignore" });
        return true;
    } catch {
        // OPTION B (came out as a fix for homebrew to fucking work)
        try {
            if (what === "brew" || what === "brew --cask") {
                try {
                    execSync(
                        `sudo -u \$(logname) bash -c 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)" && brew --version'`,
                        { stdio: "pipe" },
                    );
                    return true;
                } catch {
                    return false;
                }
            } else return false;
        } catch {
            // if it doesn't exist, throws (non-0 exit code)
            return false;
        }
    }
}
