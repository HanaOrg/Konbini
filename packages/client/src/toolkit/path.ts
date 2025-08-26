import { writeFileSync, accessSync, constants, readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { INSTALLATION_DIR, konsole } from "shared/client";
import { exec, execSync } from "child_process";
import { normalizer } from "shared/constants";
import { getPlatform } from "shared/api/platform";
import { runElevatedScript } from "../../../konpak/src/integrate";
import { validate } from "@zakahacecosas/string-utils";

export function addToUserPathEnvVariable(dir: string): void {
    // windows behavior
    if (getPlatform() === "win64") {
        try {
            const currentPath = execSync(
                `powershell -Command "[Environment]::GetEnvironmentVariable(\\"PATH\\", \\"User\\")"`,
                { encoding: "utf-8" },
            );

            if (!validate(currentPath)) throw `Unable to get PATH`;
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

export function registerGuardCronjob() {
    if (getPlatform() === "win64") {
        try {
            const out = execSync(
                `powershell -Command "$taskExists = Get-ScheduledTask | Where-Object { $_.TaskName -like 'Konbini Guard' }; if ($taskExists) { Write-Output '0' } else { Write-Output '1' }"`,
                { encoding: "utf-8" },
            );
            if (out.toString().trim() === "1") throw `task doesn't exist`;
            return;
        } catch {
            const out = runElevatedScript(
                `
            schtasks /Create /SC DAILY /TN "Konbini Guard" /TR "${INSTALLATION_DIR + "\\kbi.exe"} ensure-security" /ST 15:00 /NP /RL HIGHEST /HRESULT /F
            
            # https://stackoverflow.com/a/69266147
            $task = Get-ScheduledTask "Konbini Guard"
            $task.Description = "This ensures software downloaded through Konbini is secure. It updates our database in a daily base and immediately removes from your machine any package reported as malicious. This task was automatically created and you can leave it as is. If you delete it (please do not) it'll be created again the next time you run Konbini (showing a User Account Control prompt)."
            $task |Set-ScheduledTask
            `,
            );
            if (out !== true)
                throw `Unable to schedule Konbini Guard!\nKonbini is supposed to check our database in a daily basis in case a package you installed gets reported as unsafe. While attempting to create a scheduled task (schtasks /Create) locally, an unknown error happened.`;
            return;
        }
    } else {
        // TODO: macOS now prefers launchd over crontab
        // https://support.apple.com/guide/terminal/script-management-with-launchd-apdc6c1077b-5d5d-4d35-9c19-60f2397b2369/mac

        exec("crontab -l 2>/dev/null", (err, stdout, _) => {
            if (err) {
                konsole.err(
                    "Failed to create KGuard cronjob! This is used to ensure package safety.",
                );
                konsole.err(err);
                process.exit(1);
            }

            const existing = stdout.split("\n");
            if (existing.includes(`15 * * * * kbi ${INSTALLATION_DIR + "/kbi ensure-security"}`))
                return;

            // avoid overwriting
            const newCrontab = [...existing, `15 * * * * kbi ${INSTALLATION_DIR + "/kbi"}`].join(
                "\n",
            );

            exec(`echo "${newCrontab}" | crontab -`, (err2) => {
                if (err2) {
                    konsole.err(
                        "Failed to create KGuard cronjob! This is used to ensure package safety.",
                    );
                    konsole.err(err2);
                    process.exit(1);
                }
            });
        });
        return;
    }
}
