// deno-lint-ignore-file no-explicit-any
import { validate, validateAgainst } from "@zakahacecosas/string-utils";
import { parseKps } from "../api/manifest.ts";
import type { KONBINI_AUTHOR_ID } from "./author.ts";

export const CATEGORIES = [
    "SYSTEM_UTIL",
    "PERSONAL",
    "PRODUCTIVITY",
    "PRODUCTION",
    "EFFICIENCY",
    "DEVELOPMENT",
    "GAMING",
    "OFFICE",
    "ENTERTAINMENT",
    "COMMUNICATION",
    "EDUCATION",
    "CUSTOMIZATION",
] as const;

export type CATEGORY = (typeof CATEGORIES)[number];

export const KPS_SOURCES = [
    "wget",
    "apt",
    "snap",
    "nix",
    "brew",
    "brew-k",
    "fpak",
    "scp",
    "cho",
    "std",
] as const;

/** A KPS source. */
export type KPS_SOURCE = (typeof KPS_SOURCES)[number];

/** A Konbini Package Scope (KPS). It follows this format:
 *
 *  `manager:pkg_name`
 *
 * For a non-Konbini package, the **prefix** represents the package manager and the ***suffix*** the name of the package within that manager.
 * For a Konbini package, the **prefix** declares this as a Konbini package and the ***suffix*** indicates the filename to search for within the release.
 */
export type KONBINI_PKG_SCOPE = `${KPS_SOURCE}:${string}`;

/** A parsed KPS. */
export type PARSED_KPS =
    | {
          /** Source. All of them are self-descriptive. */
          src: KPS_SOURCE;
          /** Value. Package name for non-Konbini hosts, filename for Konbini. */
          val: string;
          /** Command to be executed  */
          cmd: string;
      }
    | {
          /** Source. All of them are self-descriptive. */
          src: "std";
          /** Value. Package name for non-Konbini hosts, filename for Konbini. */
          val: string;
          /** (null) */
          cmd: null;
      };

export const LICENSES = [
    "MIT",
    "GPLv3",
    "GPLv2",
    "Apache2",
    "BSD2Clause",
    "BSD3Clause",
    "ISC",
    "MPLv2",
    "LGPLv3",
    "EPLv2",
    "Unlicense",
    "Zlib",
    "PublicDomain",
    "ProprietaryLicense",
] as const;

/** These are license _codes_ used by us to identify and define licenses. They should not be used in the UI. */
export type LICENSE = (typeof LICENSES)[number];

/** A Git repository scope. */
export type REPOSITORY_SCOPE = `${"gh" | "gl" | "cb"}:${string}/${string}`;

export interface AGE_RATING {
    /** Does the app allow to use real currency in any way? */
    money: boolean;
    /** Does the app allow to use unmonitored chats, media reels, whatsoever? */
    social: boolean;
    /** Does the app reference illegal substances or legalized drugs / alcohol in any way? */
    substances: boolean;
    /** Does the app show scenes of real, graphical violence in any case? */
    violence: boolean;
}

/** A Konbini package manifest. */
export interface KONBINI_MANIFEST {
    /** GitHub, GitLab, or CodeBerg repository where the package _itself_ is stored.
     * Can be null, because of closed-source software.
     */
    repository: REPOSITORY_SCOPE | null;
    /** Supported platforms for the package, with their Konbini Package Scope (KPS). */
    platforms: {
        /** 64-bit Linux KPS. */
        linux64: null | KONBINI_PKG_SCOPE;
        /** ARM Linux KPS. */
        linuxARM: null | KONBINI_PKG_SCOPE;
        /** 64-bit / Intel macintoshOS KPS. */
        mac64: null | KONBINI_PKG_SCOPE;
        /** ARM / Apple Silicon macintoshOS KPS. */
        macARM: null | KONBINI_PKG_SCOPE;
        /** 64-bit Microsoft Windows KPS. */
        win64: null | KONBINI_PKG_SCOPE;
    };
    /** Package name, as displayed in the Konbini UI. */
    name: string;
    /** Package slogan, as displayed in the Konbini UI and the Konbini CLI. */
    slogan: string;
    /** Package description, as displayed in the Konbini UI. Supports basic MarkDown. */
    desc: string;
    /** Package license. */
    license: LICENSE | null;
    /** Author's unique identifier. */
    author_id: KONBINI_AUTHOR_ID;
    /** Package's logo, to be displayed in the Konbini UI. Only WEBP or PNG are allowed. */
    icon?: `https://${string}.${"webp" | "png"}` | null;
    /** A list of persons who have contributed to the development of this package. */
    maintainers?: {
        name: string;
        email?: string;
        /** One website (any) they want to link to. */
        link?: `https://${string}`;
        /** GitHub username. */
        github?: string;
    }[];
    /** Main website of the package, if any. */
    homepage?: `https://${string}`;
    /** Documentation website of the package, if any. */
    docs?: `https://${string}`;
    /** Privacy policy of the package, if any. */
    privacy?: `https://${string}`;
    /** Terms and conditions of the package, if any. */
    terms?: `https://${string}`;
    /** System requirements, if any. */
    sys_requirements?: {
        /** Minimal OS version number, if any. In Linux, any string is valid (e.g. "Ubuntu 22.04 or later"). */
        os_ver?: `win=${string | number | "x"},mac=${string | number | "x"},lin=${string | "x"}`;
        /** Minimal RAM. */
        ram_mb?: number;
        /** Minimal storage. */
        disk_mb?: number;
    };
    /** App screenshots to be displayed in the Konbini UI. Only WEBP is supported. */
    screenshot_urls?: {
        text: string;
        link: `https://${string}.${"webp" | "png"}`;
    }[];
    /**
     * A category that represents the type of tool or software the app is meant to be.
     * - `SYSTEM_UTIL`: Tools for system management (e.g., disk cleaner, sys info viewer).
     * - `CUSTOMIZATION`: Tools for system customization (e.g., themes, wallpaper providers)
     * - `PERSONAL`: Personal-related tools (e.g., health, digital wellbeing).
     * - `PRODUCTIVITY`: Tools for productivity and task management (e.g., to-do lists, reminders).
     * - `PRODUCTION`: Tools for creating or editing content (e.g., photo/video editors, music production software).
     * - `EFFICIENCY`: Tools aimed at improving efficiency (e.g., automation tools, time trackers).
     * - `DEVELOPMENT`: Tools for developers (e.g., IDEs, code editors, debugging tools).
     * - `GAMING`: Gaming-related tools (e.g., game launchers, mods, game-related utilities).
     * - `OFFICE`: Office tools (e.g., word processors, spreadsheets, presentations).
     * - `ENTERTAINMENT`: Tools for media consumption (e.g., music, video streaming, e-books).
     * - `COMMUNICATION`: Tools for communication (e.g., messaging apps, email clients, video conferencing).
     * - `EDUCATION`: Tools for learning and knowledge management (e.g., note-taking apps, educational platforms).
     */
    categories: CATEGORY[];
    /**
     * Age rating of the app. This works by specifying if the following items (which restrict age) are present.
     *
     * For anyone wondering where nudity references are, that kind of content is prohibited from Konbini.
     */
    age_rating: AGE_RATING;
    /** True if the app collects user data, with or without consent. */
    telemetry: boolean;
}

/** Validates if the given string is a valid KPS. */
export function isKps(kps: any): kps is KONBINI_PKG_SCOPE {
    try {
        parseKps(kps);
        return true;
    } catch {
        return false;
    }
}

/** Validates if the given scope is a `std:` one. */
export function isStdScope(kps: KONBINI_PKG_SCOPE): kps is `std:${string}` {
    if (kps.startsWith("std:")) return true;
    return false;
}

export function isValidManifest(manifest: any): manifest is KONBINI_MANIFEST {
    if (typeof manifest !== "object" || manifest === null) {
        return false;
    }

    const m = manifest as Partial<KONBINI_MANIFEST>;

    const isPlatform = (p: any) => p === null || isKps(p);

    const isURL = (s?: any) => validate(s) && s.startsWith("https://");

    const isImageURL = (s?: any) =>
        validate(s) && s.startsWith("https://") && (s.endsWith(".webp") || s.endsWith(".png"));

    const allPlatformsValid =
        typeof m.platforms === "object" &&
        m.platforms !== null &&
        isPlatform(m.platforms.linux64) &&
        isPlatform(m.platforms.linuxARM) &&
        isPlatform(m.platforms.mac64) &&
        isPlatform(m.platforms.macARM) &&
        isPlatform(m.platforms.win64);

    const allStrings = [m.name, m.slogan, m.desc, m.author_id].every(validate);

    const splitAuthor = (m.author_id || "").split(".");
    const validAuthorId =
        m.author_id &&
        splitAuthor.length == 2 &&
        validateAgainst(splitAuthor[0], ["org", "usr"]) &&
        validate(splitAuthor[1]);

    const splitRepo = (m.repository || "").split("/");
    const validRepository =
        m.repository === null ||
        (validate(m.repository) &&
            splitRepo.length == 2 &&
            validate(splitRepo[0]) &&
            validate(splitRepo[1]));

    const validLicense = m.license === null || validateAgainst(m.license, LICENSES);

    const validIcon = m.icon === undefined || m.icon === null || isImageURL(m.icon);

    const validMaintainers =
        m.maintainers === undefined ||
        (Array.isArray(m.maintainers) &&
            m.maintainers.every(
                (p) =>
                    typeof p === "object" &&
                    p !== null &&
                    validate(p.name) &&
                    (p.email === undefined || validate(p.email)),
            ));

    const validScreenshots =
        m.screenshot_urls === undefined ||
        (Array.isArray(m.screenshot_urls) &&
            m.screenshot_urls.every((i) => isImageURL(i.link) && validate(i.text)));

    const validCategories = Array.isArray(m.categories) && m.categories.every(validate);

    const ar = m.age_rating;
    const validAgeRating =
        typeof ar === "object" &&
        ar !== null &&
        ["money", "social", "substances", "violence"].every(
            (k) => typeof ar?.[k as keyof typeof ar] === "boolean",
        );

    return (
        (allPlatformsValid &&
            allStrings &&
            validRepository &&
            validLicense &&
            validIcon &&
            validMaintainers &&
            validAuthorId &&
            isURL(m.homepage)) ||
        (m.homepage === undefined && isURL(m.docs)) ||
        (m.docs === undefined && validScreenshots && validCategories && validAgeRating)
    );
}

/** Returns a string indicating the age rating of an app.
 *
 * `"everyone"` means anyone can use this freely.
 *
 * `"mid"` means that parental guidance is recommended, as this flag appears over `social` flagged apps.
 *
 * `"high"` means the same as `"mid"`, but a small warning will be shown in the page indicating that `money` is present in the package.
 *
 * `"very_high"` will show a warning before loading the page, as it implies either `violence` or `substances`.
 */
export function getAgeRating(data: AGE_RATING): "everyone" | "mid" | "high" | "very_high" {
    if (data.substances || data.violence) return "very_high";
    if (data.money) return "high";
    if (data.social) return "mid";
    return "everyone";
}

/** Parses the os_ver string from manifest files. */
export function parseOsVer(
    ver: string,
): { win: string | null; mac: string | null; lin: string | null } | "Invalid OS requirements." {
    const splitted = ver.split(",");

    if (splitted.length !== 3) return "Invalid OS requirements.";

    try {
        const winContent = splitted[0]!.split("win=")[1]!;
        const macContent = splitted[1]!.split("mac=")[1]!;
        const linContent = splitted[2]!.split("lin=")[1]!;

        const win =
            winContent === "x"
                ? null
                : isNaN(Number(winContent))
                  ? winContent
                  : `Windows ${winContent} or later`;
        const mac =
            macContent === "x"
                ? null
                : isNaN(Number(macContent))
                  ? macContent
                  : `macOS ${macContent} or later`;
        const lin = linContent === "x" ? null : linContent;

        return {
            win,
            mac,
            lin,
        };
    } catch {
        return "Invalid OS requirements.";
    }
}

export function isRepositoryScope(scope: any): scope is REPOSITORY_SCOPE {
    const colonSplit = scope.split(":");

    if (!validate(colonSplit[0]) || !validate(colonSplit[1])) return false;

    if (!validateAgainst(colonSplit[0], ["gh", "gl", "cb"])) return false;

    const slashSplit = colonSplit[1].split("/");

    if (!validate(slashSplit[0]) || !validate(slashSplit[1])) return false;

    return true;
}

export function parseRepositoryScope(scope: REPOSITORY_SCOPE): {
    /** Source of the repo. */
    source: "gh" | "gl" | "cb";
    /** Remote, REST API URL. */
    remote: string;
    /** Public, frontend URL. */
    public: string;
} {
    if (!isRepositoryScope(scope)) throw `Invalid REPOSITORY_SCOPE "${scope}".`;

    const colonSplit = scope.split(":");
    const pref = colonSplit[1]!;
    const slashSplit = pref.split("/");

    if (colonSplit[0] === "gh")
        return {
            source: "gh",
            remote: `https://api.github.com/repos/${slashSplit[0]}/${slashSplit[1]}/releases/latest`,
            public: `https://github.com/${slashSplit[0]}/${slashSplit[1]}`,
        };
    if (colonSplit[0] === "gl")
        return {
            source: "gl",
            remote: `https://gitlab.com/api/v4/projects/${encodeURIComponent(pref)}/releases`,
            public: `https://gitlab.com/${slashSplit[0]}/${slashSplit[1]}`,
        };
    return {
        source: "cb",
        remote: `https://codeberg.org/api/v1/repos/${slashSplit[0]}/${slashSplit[1]}/releases/latest`,
        public: `https://codeberg.org/${slashSplit[0]}/${slashSplit[1]}`,
    };
}
