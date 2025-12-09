import { validateAgainst } from "strings-utils";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import type { KPS_SOURCE } from "shared/types/manifest";
import { runElevatedScript } from "../../../konpak/src/integrate";
import { konsole } from "shared/client";

const e = (arg: string) =>
    execSync(arg, {
        stdio: "inherit",
    });

const getIdLike = () =>
    readFileSync("/etc/os-release")
        .toString()
        .toLowerCase()
        .replaceAll('"', "")
        .split("\n")
        .find((l) => l.startsWith("id_like"))
        ?.split("=")[1]
        ?.split(" ");

/** install pkg manager (at least, attempt to) */
export function installPkgMgr(mgr: KPS_SOURCE): "noop" | "edge" | "success" {
    if (mgr === "kbi") return "noop";
    // these SHOULD come preinstalled
    if (validateAgainst(mgr, ["wget", "apt"])) return "edge";
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
        const id_like = getIdLike();
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
        // this should be enough
        // other OSes i checked on flatpak docs (not all tho) either require graphical interaction with system settings or come with flatpak on recent versions
        // (and we don't really care about outdated users, smh)
        const desktop = (process.env["XDG_CURRENT_DESKTOP"] || process.env["DESKTOP_SESSION"] || "")
            .trim()
            .toLowerCase();
        const is = ["kde", "plasma"].includes(desktop)
            ? "KDE"
            : desktop === "gnome"
              ? "GNOME"
              : "none";
        const id_like = getIdLike();
        if (!id_like)
            throw `Unable to tell current distro-like env (/etc/os-release > ID_LIKE), cannot properly install Flatpak.`;
        if (id_like.includes("ubuntu")) {
            e("sudo apt install flatpak");
            e("sudo apt install gnome-software-plugin-flatpak");
            e(
                "flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo",
            );
        } else if (id_like.includes("debian")) {
            e("sudo apt install flatpak");
            if (is === "GNOME") e("sudo apt install gnome-software-plugin-flatpak");
            else if (is === "KDE") e("sudo apt install plasma-discover-backend-flatpak");
            e(
                "flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo",
            );
        } else if (id_like.includes("arch")) {
            e("sudo pacman -S flatpak");
        } else {
            throw `Unable to install Flatpak for your system (ID_LIKE ${id_like.join(" ")})`;
        }
        konsole.war(
            "After installing Flatpak a system restart is encouraged for it to properly work.",
        );
        return "success";
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
}
