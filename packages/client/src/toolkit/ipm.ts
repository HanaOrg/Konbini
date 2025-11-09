import { validateAgainst } from "strings-utils";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import type { KPS_SOURCE } from "shared/types/manifest";
import { runElevatedScript } from "../../../konpak/src/integrate";

const e = (arg: string) =>
    execSync(arg, {
        stdio: "inherit",
    });

/** install pkg manager (at least, attempt to) */
export function installPkgMgr(mgr: KPS_SOURCE): "noop" | "edge" | "success" {
    if (mgr === "kbi") return "noop";
    // these SHOULD come preinstalled
    if (validateAgainst(mgr, ["wget", "apt"])) return "edge";
    try {
        if (mgr === "nix") {
            e("curl -L https://nixos.org/nix/install -o install-nix.sh");
            e("bash install-nix.sh --no-daemon"); // (pipe)
            return "success";
        } else if (mgr === "brew" || mgr === "brew-k") {
            e(
                'bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
            );
            e("echo >> ~/.bashrc");
            e(`echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bashrc`);
            return "success";
        } else if (mgr === "snap") {
            // hell
            // worst is people doesn't like snap anyway :sob:
            const id_like = readFileSync("/etc/os-release")
                .toString()
                .toLowerCase()
                .replaceAll('"', "")
                .split("\n")
                .find((l) => l.startsWith("id_like"))
                ?.split("=")[1]
                ?.split(" ");
            if (!id_like)
                throw `Unable to tell current distro-like env (/etc/os-release > ID_LIKE), cannot properly install SnapCraft.`;
            if (id_like.includes("debian") || id_like.includes("ubuntu")) {
                e("sudo apt update");
                e("sudo apt install snapd snapcraft -y");
                return "success";
            } else if (
                id_like.includes("rhel") ||
                id_like.includes("fedora") ||
                id_like.includes("centos")
            ) {
                e("sudo dnf install snapd snapcraft -y");
                e("sudo systemctl enable --now snapd.socket");
                e("sudo ln -s /var/lib/snapd/snap /snap");
                return "success";
            } else if (id_like.includes("arch") || id_like.includes("manjaro")) {
                e("sudo pacman -S snapd snapcraft -y");
                e("sudo systemctl enable --now snapd.socket");
                e("sudo ln -s /var/lib/snapd/snap /snap");
                return "success";
            } else if (id_like.includes("suse") || id_like.includes("opensuse")) {
                e("sudo zypper install snapd snapcraft -y");
                e("sudo systemctl enable --now snapd.socket");
                e("sudo ln -s /var/lib/snapd/snap /snap");
                return "success";
            } else
                throw `Current distro-like env (/etc/os-release > ID_LIKE) equals an unknown value (${id_like}). Cannot properly install SnapCraft.`;
        } else if (mgr === "fpak") {
            return "edge"; // TODO: do this complicated thing later on
            // already had enough with apt :sob:
        } else if (mgr === "cho") {
            const out = runElevatedScript(
                `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))`,
            );
            if (out === false) throw `Unable to run (elevated) installation script for Chocolatey!`;
            return "success";
        } else {
            const out = runElevatedScript(
                "Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression",
            );
            if (out === false) throw `Unable to run (elevated) installation script for Chocolatey!`;
            return "success";
        }
    } catch (err) {
        throw err;
    }
}
