import { isStdScope, type KONBINI_MANIFEST, type KONBINI_PKG_SCOPE } from "shared/types/manifest";
import IconMac from "../../assets/mac";
import IconTux from "../../assets/tux";
import IconWin from "../../assets/win";
import { parseKps } from "shared/api/manifest";
import { toUpperCaseFirst } from "@zakahacecosas/string-utils";

export default function PlatformSupport({
    platforms,
}: {
    platforms: KONBINI_MANIFEST["platforms"];
}) {
    function supported(plat: KONBINI_PKG_SCOPE | null): string {
        if (!plat) return "unsupported";
        if (isStdScope(plat)) return "supported";

        const src = parseKps(plat).src;
        const aliasing =
            src === "cho"
                ? "Chocolatey"
                : src === "scp"
                  ? "Scoop"
                  : src === "fpak"
                    ? "Flatpak"
                    : src === "wget"
                      ? "WinGet"
                      : src === "brew"
                        ? "Homebrew"
                        : src === "brew-k"
                          ? "Homebrew"
                          : src === "apt"
                            ? "DPKG"
                            : src === "nix"
                              ? "Nix"
                              : "SnapCraft";

        return `aliased to ${aliasing}`;
    }

    const linux64 = supported(platforms.linux64);
    const linuxARM = supported(platforms.linuxARM);
    const mac64 = supported(platforms.mac64);
    const macARM = supported(platforms.macARM);
    const win = supported(platforms.win64);

    const platformsToRender = [
        {
            plat: "Linux",
            arch: "64",
            support: linux64,
        },
        {
            plat: "Linux",
            arch: "ARM",
            support: linuxARM,
        },
        {
            plat: "macOS",
            arch: "64",
            support: mac64,
        },
        {
            plat: "macOS",
            arch: "ARM",
            support: macARM,
        },
        {
            plat: "Windows",
            arch: "64",
            support: win,
        },
    ];

    return (
        <>
            {[linux64, linuxARM, mac64, macARM, win].includes("aliased") && (
                <p>
                    <i>
                        "Aliased" means it is supported, but not via Konbini itself. Konbini is both
                        a standalone package manager and a downloader for other package managers
                        such as WinGet, DPKG, Homebrew, or Flathub (among others); "aliased" means
                        the package will be downloaded through a trusted 3<sup>rd</sup> party
                        package manager.
                    </i>
                </p>
            )}
            <div className="w-full grid grid-cols-5 grid-rows-1 gap-4">
                {platformsToRender.map((p) => (
                    <div className="h-54 p-6 border-1 border-[#2A2A2A] rounded-2xl bg-[#151515] relative overflow-hidden">
                        <p className="text-3xl text-white font-semibold">{p.plat}</p>
                        <p className="text-xl text-white font-light opacity-[0.7]">{p.arch}</p>
                        <div className="absolute top-8 right-6">
                            {p.plat === "Linux" && <IconTux />}
                            {p.plat === "macOS" && <IconMac />}
                            {p.plat === "Windows" && <IconWin />}
                        </div>
                        <p className="text-xl font-normal absolute bottom-4 text-center left-0 right-0">
                            {toUpperCaseFirst(p.support)}
                        </p>
                        <div
                            className="w-[100%] m-auto h-14 absolute bottom-2 blur-[80px]"
                            style={{
                                backgroundColor: p.support.startsWith("aliased")
                                    ? "#65A5FF"
                                    : p.support === "unsupported"
                                      ? "#FF7C65"
                                      : "#6FFF65",
                            }}
                        />
                    </div>
                ))}
            </div>
        </>
    );
}
