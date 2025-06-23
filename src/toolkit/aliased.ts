import { konsole } from "./konsole";
import type { KONBINI_MANIFEST, KPS_SOURCE } from "../types/manifest";
import { execSync } from "child_process";
import type { KONBINI_PKG_LOCKFILE } from "../types/lockfile";
import { writeLockfile } from "./write";

function noNewUpdates(errorMsg: string): boolean {
    // TODO - the rest

    // WinGet
    if (errorMsg.includes("No newer package versions are available from the configured sources."))
        return true;

    return false;
}

export function installAliasedPackage(params: {
    pkgName: string;
    kps: {
        src: KPS_SOURCE;
        val: string;
    };
    manifest: KONBINI_MANIFEST;
    method: "install" | "update";
    reinstall: boolean;
}): "upToDate" | "no-op" | "needsPkgMgr" | "installedOrUpdated" {
    const { kps, manifest, pkgName, method, reinstall } = params;

    // no-op
    if (kps.src === "std") return "no-op";

    const name = kps.src.toUpperCase();
    const command =
        kps.src === "apt"
            ? "apt"
            : kps.src === "nix"
              ? "nix-env"
              : kps.src === "brew"
                ? "brew"
                : kps.src === "brew-k"
                  ? "brew --cask"
                  : kps.src === "wget"
                    ? "winget"
                    : kps.src === "fpak"
                      ? "flatpak"
                      : "snap";
    konsole.adv(
        `${manifest.name} is using ${name}, a non-Konbini remote. We'll ${method} the package for you using '${command}'.`,
    );

    const options: Record<Exclude<KPS_SOURCE, "std">, string> = {
        "apt":
            method === "install"
                ? reinstall
                    ? `sudo apt install -y --reinstall ${kps.val}`
                    : `sudo apt install -y ${kps.val}`
                : `sudo apt upgrade -y ${kps.val}`,

        "nix":
            method === "install"
                ? reinstall
                    ? `nix-env -e ${kps.val} && nix-env -iA nixpkgs.${kps.val}`
                    : `nix-env -iA nixpkgs.${kps.val}`
                : `nix-env -uA nixpkgs.${kps.val}`,

        "snap":
            method === "install"
                ? reinstall
                    ? `sudo snap remove ${kps.val} --yes && sudo snap install ${kps.val} --yes`
                    : `sudo snap install ${kps.val} --yes`
                : `sudo snap refresh ${kps.val} --yes`,

        "brew":
            method === "install"
                ? reinstall
                    ? `brew reinstall ${kps.val}`
                    : `brew install ${kps.val}`
                : `brew upgrade ${kps.val}`,

        "brew-k":
            method === "install"
                ? reinstall
                    ? `brew reinstall --cask ${kps.val}`
                    : `brew install --cask ${kps.val}`
                : `brew upgrade --cask ${kps.val}`,

        "wget":
            method === "install"
                ? reinstall
                    ? `winget install ${kps.val} --force --accept-package-agreements --accept-source-agreements`
                    : `winget install ${kps.val} --accept-package-agreements --accept-source-agreements`
                : `winget upgrade --accept-package-agreements --accept-source-agreements --id ${kps.val}`,

        "fpak":
            method === "install"
                ? reinstall
                    ? `flatpak install -y --reinstall flathub ${kps.val}`
                    : `flatpak install -y flathub ${kps.val}`
                : `flatpak update -y ${kps.val}`,
    };

    try {
        execSync(`${command} -v`);
    } catch {
        konsole.err(
            `This package requires a 3rd party package manager that is not installed on your system.`,
        );
        return "needsPkgMgr";
    }

    try {
        execSync(options[kps.src]);
    } catch (error) {
        if (noNewUpdates((error as any).stdout)) {
            konsole.suc(`${manifest.name} is already up to date!`);
            return "upToDate";
        }
        throw `Error installing package '${kps.val}' with ${name}: ${error}`;
    }

    konsole.dbg(
        `Because ${name} is a trusted registry, we don't perform GPG or SHA checks.\n      Keep that in mind.`,
    );

    const lockfile: KONBINI_PKG_LOCKFILE = {
        pkg: pkgName,
        scope: kps.src,
        timestamp: new Date().toString(),
    };
    writeLockfile(lockfile, pkgName, manifest.author_id);
    return "installedOrUpdated";
}
