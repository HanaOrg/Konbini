import { getPlatform } from "shared/api/platform";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { validate } from "@zhc.js/string-utils";

export async function selfUpdate() {
    const platform = getPlatform();
    const suffix = platform === "win64" ? ".ps1" : ".sh";
    const res = await fetch(`https://konbini.vercel.app/dl${suffix}`);
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
