import type { KPS_SOURCE } from "shared/types/manifest";

export const ALIASED_CMDs: Record<
    Exclude<KPS_SOURCE, "kbi">,
    Record<"install" | "reinstall" | "update" | "exists" | "uninstall", (pkg: string) => string>
> = {
    "apt": {
        install: (pkg) => `sudo apt install -y ${pkg}`,
        reinstall: (pkg) => `sudo apt install -y --reinstall ${pkg}`,
        update: (pkg) => `sudo apt upgrade -y ${pkg}`,
        exists: (pkg) => `sudo apt list | grep -w ${pkg}`,
        uninstall: (pkg) => `sudo apt remove -y ${pkg}`,
    },

    "nix": {
        install: (pkg) => `nix-env -iA nixpkgs.${pkg}`,
        reinstall: (pkg) => `nix-env -e ${pkg} && nix-env -iA nixpkgs.${pkg}`,
        update: (pkg) => `nix-env -uA nixpkgs.${pkg}`,
        exists: (pkg) => `nix-env -q | grep -w ${pkg}`,
        uninstall: (pkg) => `nix-env -e ${pkg}`,
    },

    "snap": {
        install: (pkg) => `sudo snap install ${pkg}`,
        reinstall: (pkg) => `sudo snap remove ${pkg} && sudo snap install ${pkg}`,
        update: (pkg) => `sudo snap refresh ${pkg}`,
        exists: (pkg) => `snap list | grep -w ${pkg}`,
        uninstall: (pkg) => `sudo snap remove ${pkg}`,
    },

    "brew": {
        install: (pkg) => `brew install ${pkg}`,
        reinstall: (pkg) => `brew reinstall ${pkg}`,
        update: (pkg) => `brew upgrade ${pkg}`,
        exists: (pkg) => `brew list --formula | grep -w ${pkg}`,
        uninstall: (pkg) => `brew uninstall ${pkg}`,
    },

    "brew-k": {
        install: (pkg) => `brew install --cask ${pkg}`,
        reinstall: (pkg) => `brew reinstall --cask ${pkg}`,
        update: (pkg) => `brew upgrade --cask ${pkg}`,
        exists: (pkg) => `brew list --cask | grep -w ${pkg}`,
        uninstall: (pkg) => `brew uninstall --cask ${pkg}`,
    },

    "wget": {
        install: (pkg) =>
            `winget install ${pkg} --accept-package-agreements --accept-source-agreements`,
        reinstall: (pkg) =>
            `winget install ${pkg} --force --accept-package-agreements --accept-source-agreements`,
        update: (pkg) =>
            `winget upgrade --accept-package-agreements --accept-source-agreements --id ${pkg}`,
        exists: (pkg) => `winget list --name ${pkg.split(".")[1]}`,
        uninstall: (pkg) =>
            `winget uninstall ${pkg} --accept-package-agreements --accept-source-agreements`,
    },

    "fpak": {
        install: (pkg) => `flatpak install -y flathub ${pkg}`,
        reinstall: (pkg) => `flatpak install -y --reinstall flathub ${pkg}`,
        update: (pkg) => `flatpak update -y ${pkg}`,
        exists: (pkg) => `flatpak list | grep -w ${pkg}`,
        uninstall: (pkg) => `flatpak uninstall -y ${pkg}`,
    },

    "scp": {
        install: (pkg) => `scoop install ${pkg}`,
        reinstall: (pkg) => `scoop install ${pkg} --force`,
        update: (pkg) => `scoop update ${pkg}`,
        exists: (pkg) => `scoop list ${pkg}`,
        uninstall: (pkg) => `scoop uninstall ${pkg}`,
    },

    "cho": {
        install: (pkg) => `choco install ${pkg} -y`,
        reinstall: (pkg) => `choco install ${pkg} --force -y`,
        update: (pkg) => `choco upgrade ${pkg} -y`,
        // * see aliased.ts/installAliasedPackage() right after return "needsPkgMgr"
        exists: (pkg) => `choco list --exact ${pkg} | findstr -e "1 packages installed."`,
        uninstall: (pkg) => `choco uninstall ${pkg} -y`,
    },
} as const;
