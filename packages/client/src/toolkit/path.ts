import { writeFileSync, accessSync, constants, readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { konsole } from "shared/client";
import { execSync } from "child_process";
import { normalizer } from "shared/constants";
import { getPlatform } from "shared/api/platform";

export function addToUserPathEnvVariable(dir: string) {
    // windows behavior
    if (getPlatform() === "win64") {
        try {
            const currentPath = execSync("echo %PATH%", { encoding: "utf-8" }).trim();

            if (normalizer(currentPath).includes(normalizer(dir))) return;

            const path = new Set(currentPath.split(";").filter(Boolean));

            const newPath = [dir.trim(), ...path].join(";");

            execSync(
                `powershell -Command "[Environment]::SetEnvironmentVariable(\\"PATH\\", \\"${newPath}\\", \\"User\\")"`,
            );
        } catch (err) {
            konsole.err("Failed to setx PATH:", err);
        }

        return;
    }

    const home = homedir();
    const exportLine = `export PATH="${dir}:$PATH"`;

    for (const file of [".bashrc", ".zshrc", ".profile", ".bash_profile"]) {
        const fullPath = join(home, file);

        try {
            accessSync(fullPath, constants.F_OK);
        } catch {
            continue; // skip if file doesn't exist
        }

        const content = readFileSync(fullPath, "utf-8");

        // Check if already present
        const alreadyIncluded = content.includes(dir) || content.includes(exportLine);
        if (alreadyIncluded) return;

        // Backup original
        writeFileSync(fullPath + ".bak", content);

        // Add line at end with comment
        const newContent = `${content.trim()}\n\n# Added by Konbini\n${exportLine}\n`;
        writeFileSync(fullPath, newContent);

        return;
    }

    konsole.war(
        "No valid RC file found in your system. For your installation to be findable, please add the following to wherever your PATH configuration is stored:",
    );
    konsole.war(exportLine);
}
