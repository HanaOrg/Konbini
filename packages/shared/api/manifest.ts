import { validate, validateAgainst } from "@zakahacecosas/string-utils";
import {
    type KONBINI_MANIFEST,
    type KONBINI_PKG_SCOPE,
    type KPS_SOURCE,
    KPS_SOURCES,
} from "../types/manifest.ts";
import type { KONBINI_HASHFILE } from "../types/files.ts";
import process from "node:process";
import { getPlatform } from "./platform.ts";

/** Parser for Konbini Package Scopes */
export function parseKps(scope: unknown): {
    /** Source. All of them are self-descriptive. */
    src: KPS_SOURCE;
    /** Value. Package name for non-Konbini hosts, filename for Konbini. */
    val: string;
} {
    if (!validate(scope as string)) {
        throw `Invalid KPS (not a string): ${scope}.`;
    }
    const splitted = (scope as string).split(":");
    if (splitted.length !== 2) {
        throw `Invalid KPS (${splitted.length} occurrences upon splitting): ${scope}`;
    }
    if (!splitted[0]) {
        throw `Invalid KPS (no prefix): ${scope}`;
    }
    if (!splitted[1]) {
        throw `Invalid KPS (no suffix): ${scope}`;
    }
    if (!validateAgainst(splitted[0], KPS_SOURCES)) {
        throw `Invalid KPS (prefix does not match specification): ${scope}`;
    }
    return {
        src: splitted[0],
        val: splitted[1],
    };
}

/** Gets the Konbini Package Scope relevant to the user's current platform. */
export function getCurrentPlatformKps(
    platforms: KONBINI_MANIFEST["platforms"],
): KONBINI_PKG_SCOPE | null {
    if (process.platform === "linux") {
        if (process.arch === "x64") {
            return platforms.linux64;
        } else if (process.arch === "arm64") {
            return platforms.linuxARM;
        }
        throw "Impossible error - Konbini is running from an unsupported Linux platform.";
    } else if (process.platform === "darwin") {
        if (process.arch === "x64") {
            return platforms.mac64;
        } else if (process.arch === "arm64") {
            return platforms.macARM;
        }
        throw "Impossible error - Konbini is running from an unsupported Apple macintoshOS platform.";
    } else if (process.platform === "win32") {
        if (process.arch === "x64") {
            return platforms.win64;
        }
        throw "Impossible error - Konbini is running from an unsupported Microsoft Windows platform.";
    } else {
        throw "Impossible error - Konbini is running from an unsupported, unknown platform.";
    }
}

/** Resolves to the `index[key]` of the Konbini hashfile required for this platform. */
export function getCurrentPlatformShaKey(): keyof KONBINI_HASHFILE {
    const plat = getPlatform();
    if (plat === "linux64") {
        return "linux_64_sha";
    }
    if (plat === "linuxArm") {
        return "linux_arm_sha";
    }
    if (plat === "mac64") {
        return "mac_64_sha";
    }
    if (plat === "macArm") {
        return "mac_arm_sha";
    }
    if (plat === "win64") {
        return "win64_sha";
    }
    throw "this error should never throw and only exists to avoid a TS type error";
}
