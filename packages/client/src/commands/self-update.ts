import { getPlatform } from "shared/api/platform";
import { writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { spawn } from "child_process";
import { validate } from "strings-utils";

export async function selfUpdate() {
    const platform = getPlatform();
    const suffix = platform === "win64" ? ".ps1" : ".sh";
    const res = await fetch(`https://fuckingnode.github.io/install${suffix}`);
    const path = join(tmpdir(), "kbi-updater-" + Date.now() + suffix);
    writeFileSync(path, await res.bytes());
    spawn(
        [
            platform === "win64" ? "powershell" : "bash",
            platform === "win64" ? "-File" : undefined,
            path,
            process.pid.toString(),
        ]
            .filter(validate)
            .join(" "),
    ).unref();
}
