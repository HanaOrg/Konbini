import { execSync } from "child_process";
import { getPlatform } from "shared/api/platform";

/** Checks if anything is locally installed (and invocable via PATH). */
export function exists(what: string): boolean {
    const cmd = getPlatform() === "win64" ? `powershell where.exe ${what}` : `command -v ${what}`;
    try {
        execSync(cmd, { stdio: "ignore" });
        return true;
    } catch {
        // if it doesn't exist, throws (non-0 exit code)
        return false;
    }
}
