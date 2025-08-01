import { validate, validateAgainst, type UnknownString } from "@zakahacecosas/string-utils";
import {
    type KONBINI_PKG_SCOPE,
    type PARSED_KPS,
    type PARSED_SPECIFIC_KPS,
    isSpecificParsedKps,
    KPS_SOURCES,
} from "../types/manifest.ts";

/** Parser for Konbini Package Scopes */
export function parseKps(scope: UnknownString): PARSED_KPS | PARSED_SPECIFIC_KPS {
    if (!validate(scope)) throw `Invalid KPS (not a string): ${scope}.`;
    const splitted = scope.split(":");
    if (splitted.length !== 2 && splitted.length !== 3) {
        throw `Invalid KPS (${splitted.length} occurrences upon splitting): ${scope}`;
    }

    const src = splitted[0];
    const value = splitted[1];

    if (!src) throw `Invalid KPS (no prefix): ${scope}`;
    if (!value) throw `Invalid KPS (no suffix): ${scope}`;
    if (!validateAgainst(src, KPS_SOURCES)) {
        throw `Invalid KPS (prefix does not match specification): ${scope}`;
    }
    const cmd =
        src === "apt"
            ? "apt"
            : src === "nix"
              ? "nix-env"
              : src === "brew"
                ? "brew"
                : src === "brew-k"
                  ? "brew --cask"
                  : src === "wget"
                    ? "winget"
                    : src === "fpak"
                      ? "flatpak"
                      : src === "snap"
                        ? "snap"
                        : src === "cho"
                          ? "choco"
                          : "scoop";
    const name =
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
    if (!value.includes("@")) {
        if (src === "kbi")
            return {
                src,
                value,
                cmd: null,
                name: "Konbini",
            };
        return {
            src,
            value,
            cmd,
            name,
        };
    }
    const srcset = scope.split("@")[1];
    if (!validate(srcset)) throw `Invalid KPS (w/srcset) (Invalid string): ${srcset}`;
    const splitSrcset = srcset.split("#");
    const srcUrl = splitSrcset[0];
    const srcName = splitSrcset[1];
    if (!validate(srcUrl)) throw `Invalid KPS (w/srcset) (no/invalid prefix): ${srcset}`;
    if (!validate(srcName) && src !== "apt") throw `Invalid KPS (w/srcset) (no suffix): ${srcset}`;
    return {
        src,
        value: value.split("@")[0]!,
        cmd,
        name,
        at: {
            url: srcUrl === "-" ? null : (srcUrl ?? null),
            name: srcName ?? null,
        },
    };
}

/** Constructor for parsed Konbini Package Scopes */
export function constructKps(scope: PARSED_KPS | PARSED_SPECIFIC_KPS): KONBINI_PKG_SCOPE {
    if (isSpecificParsedKps(scope)) {
        return `${scope.src}:${scope.value}@${scope.at.url ?? "-"}${scope.at.name ? `#${scope.at.name}` : ""}`;
    }
    return `${scope.src}:${scope.value}`;
}
