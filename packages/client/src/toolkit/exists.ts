import { execSync } from "child_process";
// import { getPlatform } from "shared/api/platform";

/** Checks if anything is locally installed (and invocable via PATH). */
export function exists(what: string): boolean {
    // const cmd = getPlatform() === "win64" ? `powershell where.exe ${what}` : `command -v ${what}`;
    try {
        // ok i have two ways of doing this and will iteratively test
        // until i find the most stable one

        // OPTION A (default)
        // execSync(cmd, { stdio: "ignore" });

        // OPTION B (came out as a fix for homebrew to fucking work)
        // this relies on all package managers supporting -v
        // i wouldn't be surprised by some random tool doing stuff differently
        // don't forget to check anytime in the future
        execSync(`bash -c "source ~/.bashrc && ${what} -v"`, { stdio: "pipe" });
        return true;
    } catch (e) {
        // if it doesn't exist, throws (non-0 exit code)
        return false;
    }
}
