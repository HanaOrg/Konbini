export function getDesktopPlatform(): {
    plat: "Windows" | "macOS" | "Linux";
    arch: "ARM" | "64" | "32";
} {
    const ua = navigator.userAgent;

    return {
        plat: ua.includes("Windows") ? "Windows" : ua.includes("Macintosh") ? "macOS" : "Linux",
        arch:
            ua.includes("ARM") || ua.includes("aarch64")
                ? "ARM"
                : ua.includes("x86_64") || ua.includes("x64") || ua.includes("Intel Mac")
                  ? "64"
                  : "32",
    };
}
