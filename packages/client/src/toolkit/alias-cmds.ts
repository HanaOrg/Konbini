import type { KPS_SOURCE } from "shared/types/manifest";

/** ... */
const microsoft = "--accept-package-agreements --accept-source-agreements";

export const ALIASED_CMDs: Record<
    Exclude<KPS_SOURCE, "kbi">,
    Record<
        "check" | "install" | "reinstall" | "update" | "exists" | "uninstall",
        (pkg: string) => string
    >
> = {
    "apt": {
        install: (pkg) => `sudo apt install -y ${pkg}`,
        reinstall: (pkg) => `sudo apt install -y --reinstall ${pkg}`,
        update: (pkg) => `sudo apt upgrade -y ${pkg}`,
        exists: (pkg) => `sudo apt list | grep -w ${pkg}`,
        uninstall: (pkg) => `sudo apt remove -y ${pkg}`,
        check: (_) => "apt list --upgradable",
    },

    "nix": {
        install: (pkg) => `nix-env -iA nixpkgs.${pkg}`,
        reinstall: (pkg) => `nix-env -e ${pkg} && nix-env -iA nixpkgs.${pkg}`,
        update: (pkg) => `nix-env -uA nixpkgs.${pkg}`,
        exists: (pkg) => `nix-env -q | grep -w ${pkg}`,
        uninstall: (pkg) => `nix-env -e ${pkg}`,
        check: (_) => `nix-channel --update && nix-env -q ${_} --compare-versions`,
    },

    "snap": {
        install: (pkg) => `sudo snap install ${pkg}`,
        reinstall: (pkg) => `sudo snap remove ${pkg} && sudo snap install ${pkg}`,
        update: (pkg) => `sudo snap refresh ${pkg}`,
        exists: (pkg) => `snap list | grep -w ${pkg}`,
        uninstall: (pkg) => `sudo snap remove ${pkg}`,
        check: (_) => "snap refresh --list",
    },

    "brew": {
        install: (pkg) => `brew install ${pkg}`,
        reinstall: (pkg) => `brew reinstall ${pkg}`,
        update: (pkg) => `brew upgrade ${pkg}`,
        exists: (pkg) => `brew list --formula | grep -w ${pkg}`,
        uninstall: (pkg) => `brew uninstall ${pkg}`,
        check: (_) => "brew outdated",
    },

    "brew-k": {
        install: (pkg) => `brew install --cask ${pkg}`,
        reinstall: (pkg) => `brew reinstall --cask ${pkg}`,
        update: (pkg) => `brew upgrade --cask ${pkg}`,
        exists: (pkg) => `brew list --cask | grep -w ${pkg}`,
        uninstall: (pkg) => `brew uninstall --cask ${pkg}`,
        check: (_) => "brew outdated",
    },

    "wget": {
        install: (pkg) => `winget install ${pkg} ${microsoft}`,
        reinstall: (pkg) => `winget install ${pkg} --force ${microsoft}`,
        update: (pkg) => `winget upgrade ${microsoft} --id ${pkg}`,
        exists: (pkg) => `winget list --id ${pkg}`,
        uninstall: (pkg) => `winget uninstall ${pkg} ${microsoft}`,
        check: (_) => "winget upgrade",
    },

    "fpak": {
        install: (pkg) => `flatpak install -y flathub ${pkg}`,
        reinstall: (pkg) => `flatpak install -y --reinstall flathub ${pkg}`,
        update: (pkg) => `flatpak update -y ${pkg}`,
        exists: (pkg) => `flatpak list | grep -w ${pkg}`,
        uninstall: (pkg) => `flatpak uninstall -y ${pkg}`,
        check: (_) => "echo n | flatpak update",
    },

    "scp": {
        install: (pkg) => `scoop install ${pkg}`,
        reinstall: (pkg) => `scoop install ${pkg} --force`,
        update: (pkg) => `scoop update ${pkg}`,
        exists: (pkg) => `scoop list ${pkg}`,
        uninstall: (pkg) => `scoop uninstall ${pkg}`,
        check: (_) => "scoop update && scoop status",
    },

    "cho": {
        install: (pkg) => `choco install ${pkg} -y`,
        reinstall: (pkg) => `choco install ${pkg} --force -y`,
        update: (pkg) => `choco upgrade ${pkg} -y`,
        // * see aliased.ts/installAliasedPackage() right after return "needsPkgMgr"
        exists: (pkg) => `choco list --exact ${pkg}"`,
        uninstall: (pkg) => `choco uninstall ${pkg} -y`,
        check: (_) => "choco outdated",
    },
} as const;
