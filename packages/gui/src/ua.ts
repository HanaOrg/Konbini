import type { SUPPORTED_PLATFORMS } from "shared/types/manifest";

export function getDesktopPlatform(): {
    plat: "Windows" | "macOS" | "Linux";
    arch: "ARM" | "64" | "32";
    asSupported: SUPPORTED_PLATFORMS;
} {
    const ua = navigator.userAgent;

    const ret: {
        plat: "Windows" | "macOS" | "Linux";
        arch: "ARM" | "64" | "32";
    } = {
        plat: ua.includes("Windows") ? "Windows" : ua.includes("Macintosh") ? "macOS" : "Linux",
        arch:
            ua.includes("ARM") || ua.includes("aarch64")
                ? "ARM"
                : ua.includes("x86_64") || ua.includes("x64") || ua.includes("Intel Mac")
                  ? "64"
                  : "32",
    };

    return {
        ...ret,
        asSupported:
            ret.plat === "Windows"
                ? "win64"
                : ret.plat === "Linux"
                  ? ret.arch === "ARM"
                      ? "linuxArm"
                      : "linux64"
                  : ret.arch === "ARM"
                    ? "macArm"
                    : "mac64",
    };
}
