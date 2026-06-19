import type { SUPPORTED_PLATFORMS } from "../types/manifest";

export function getPlatform(): SUPPORTED_PLATFORMS {
    switch (process.platform) {
        case "linux": {
            if (process.arch === "x64") {
                return "linux64";
            }
            if (process.arch === "arm64") {
                return "linuxArm";
            }
            throw "Impossible error - Konbini is running from an unsupported Linux platform.";
        }
        case "darwin": {
            if (process.arch === "x64") {
                return "mac64";
            }
            if (process.arch === "arm64") {
                return "macArm";
            }
            throw "Impossible error - Konbini is running from an unsupported Apple macintoshOS platform.";
        }
        case "win32": {
            if (process.arch === "x64") {
                return "win64";
            }
            throw "Impossible error - Konbini is running from an unsupported Microsoft Windows platform.";
        }
        default: {
            throw "Impossible error - Konbini is running from an unsupported, unknown platform.";
        }
    }
}
