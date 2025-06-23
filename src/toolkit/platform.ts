export function getPlatform(): "linux64" | "linuxArm" | "mac64" | "macArm" | "win64" {
    if (process.platform === "linux") {
        if (process.arch === "x64") return "linux64";
        else if (process.arch === "arm64") return "linuxArm";
        throw "Impossible error - Konbini is running from an unsupported Linux platform.";
    } else if (process.platform === "darwin") {
        if (process.arch === "x64") return "mac64";
        else if (process.arch === "arm64") return "macArm";
        throw "Impossible error - Konbini is running from an unsupported Apple macintoshOS platform.";
    } else if (process.platform === "win32") {
        if (process.arch === "x64") return "win64";
        throw "Impossible error - Konbini is running from an unsupported Microsoft Windows platform.";
    } else {
        throw "Impossible error - Konbini is running from an unsupported, unknown platform.";
    }
}
