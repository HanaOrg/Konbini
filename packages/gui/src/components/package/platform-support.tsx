import { isKbiScope, type KONBINI_MANIFEST, type KONBINI_PKG_SCOPE } from "shared/types/manifest";
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
        if (isKbiScope(plat)) return "supported";
        return `alias -> ${parseKps(plat).name}`;
    }

    const linux64 = supported(platforms.linux64);
    const linuxArm = supported(platforms.linuxArm);
    const mac64 = supported(platforms.mac64);
    const macArm = supported(platforms.macArm);
    const win = supported(platforms.win64);

    const platformsToRender = [
        {
            plat: "Windows",
            arch: "64",
            support: win,
        },
        {
            plat: "Linux",
            arch: "64",
            support: linux64,
        },
        {
            plat: "Linux",
            arch: "ARM",
            support: linuxArm,
        },
        {
            plat: "macOS",
            arch: "64",
            support: mac64,
        },
        {
            plat: "macOS",
            arch: "ARM",
            support: macArm,
        },
    ];

    return (
        <>
            {[linux64, linuxArm, mac64, macArm, win].includes("aliased") && (
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
            <div className="w-full grid grid-cols-5 grid-rows-1">
                {platformsToRender.map((p) => (
                    <div
                        title={
                            p.support.startsWith("alias")
                                ? `For ${p.plat}${p.arch} this package can be installed through Konbini,\nthough it is actually published to the shown package manager.`
                                : p.support === "unsupported"
                                  ? `This package is not supported for ${p.plat}${p.arch}. How sad :(`
                                  : `This package can be installed for ${p.plat}${p.arch} through Konbini! How cool.`
                        }
                        className={`h-45 p-6 border-1 border-[#303030] rounded${p.plat === "Linux" && p.arch === "64" ? "-l-2xl" : p.plat === "Windows" ? "-r-2xl" : "-0"} bg-[#151515] hover:bg-[#1F1F1F] relative overflow-hidden`}
                    >
                        <p className="text-3xl text-white font-semibold">{p.plat}</p>
                        <p className="text-xl text-white font-light opacity-[0.7]">{p.arch}</p>
                        <div className={`absolute top-7 right-4 opacity-[0.95]`}>
                            {p.plat === "Linux" && <IconTux />}
                            {p.plat === "macOS" && <IconMac />}
                            {p.plat === "Windows" && <IconWin />}
                        </div>
                        <p className="text-xl font-normal absolute bottom-4 text-center left-5">
                            {toUpperCaseFirst(p.support)}
                        </p>
                        <div
                            className="w-[120%] m-auto h-14 absolute top-2 right-5 blur-[65px]"
                            style={{
                                backgroundColor: p.support.startsWith("alias")
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
