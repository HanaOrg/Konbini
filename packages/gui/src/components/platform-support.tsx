import { isStdScope, type KONBINI_MANIFEST, type KONBINI_PKG_SCOPE } from "shared/types/manifest";
import IconMac from "../assets/mac";
import IconTux from "../assets/tux";
import IconWin from "../assets/win";
import { parseKps } from "shared/api/manifest";

export default function PlatformSupport({
    platforms,
}: {
    platforms: KONBINI_MANIFEST["platforms"];
}) {
    function supported(plat: KONBINI_PKG_SCOPE | null): string {
        if (!plat) return "unsupported";
        if (isStdScope(plat)) return "supported";
        return `aliased to ${parseKps(plat)
            .src.replace("cho", "chocolatey")
            .replace("scp", "scoop")
            .replace("fpak", "flatpak")
            .replace("wget", "winget")
            .replace("brew-k", "brew")}`;
    }

    const linux64 = supported(platforms.linux64);
    const linuxARM = supported(platforms.linuxARM);
    const mac64 = supported(platforms.mac64);
    const macARM = supported(platforms.macARM);
    const win = supported(platforms.win64);

    return (
        <>
            {[linux64, linuxARM, mac64, macARM, win].includes("aliased") ? (
                <p>
                    <i>
                        "Aliased" means it is supported, but not via Konbini itself. Konbini is both
                        a standalone package manager and a downloader for other package managers
                        such as WinGet, DPKG, Homebrew, or Flathub (among others); "aliased" means
                        the package will be downloaded through a trusted 3<sup>rd</sup> party
                        package manager.
                    </i>
                </p>
            ) : (
                <></>
            )}
            <div className="platforms">
                <div className="platform">
                    <IconTux arch="64" />
                    Linux 64
                    <div className={`badge ${linux64}`}>{linux64}</div>
                </div>
                <div className="platform">
                    <IconTux arch="ARM" />
                    Linux ARM
                    <div className={`badge ${linuxARM}`}>{linuxARM}</div>
                </div>
                <div className="platform">
                    <IconMac arch="64" />
                    macOS Intel
                    <div className={`badge ${mac64}`}>{mac64}</div>
                </div>
                <div className="platform">
                    <IconMac arch="ARM" />
                    macOS Apple Silicon
                    <div className={`badge ${macARM}`}>{macARM}</div>
                </div>
                <div className="platform">
                    <IconWin arch="64" />
                    Windows 64
                    <div className={`badge ${win}`}>{win}</div>
                </div>
            </div>
        </>
    );
}
