import type { AUTHOR_ID } from "./author";

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

export const KPS_SOURCES = ["wget", "apt", "snap", "nix", "brew", "brew-k", "std", "fpak"] as const;

/** A KPS source. */
export type KPS_SOURCE = (typeof KPS_SOURCES)[number];

/** A Konbini package scope. It follows this format:
 *
 *  `manager:pkg_name`
 *
 * For a non-Konbini package from either `apt`, `nix`, `brew`, or `wget`, the **prefix** represents the package manager and the ***suffix*** the name of the package within that manager.
 * For a Konbini package (`std`), the **prefix** obviously declares this as a Konbini package and the ***suffix*** indicates the filename to search for within the release.
 */
export type KONBINI_PKG_SCOPE = `${KPS_SOURCE}:${string}`;
/** These are license _codes_ used by us to identify and define licenses. They should not be used in the UI. */
export type LICENSE =
    | "MIT"
    | "GPLv3"
    | "GPLv2"
    | "Apache2"
    | "BSD2Clause"
    | "BSD3Clause"
    | "ISC"
    | "MPLv2"
    | "LGPLv3"
    | "EPLv2"
    | "Unlicense"
    | "Zlib"
    | "PublicDomain"
    | "ProprietaryLicense";

/** A Konbini package manifest. */
export interface KONBINI_MANIFEST {
    /** GitHub repository where the package _itself_ is stored. */
    repository: `${string}/${string}`;
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
    author_id: AUTHOR_ID;
    /** Package's logo, to be displayed in the Konbini UI. Only WEBP is supported. */
    icon: `https://${string}.webp` | null;
    /** A list of persons who have contributed to the development of this package. */
    maintainers?: { name: string; email?: string }[];
    /** Main website of the package, if any. */
    homepage?: `https://${string}`;
    /** Documentation website of the package, if any. */
    docs?: `https://${string}`;
    /** App screenshots to be displayed in the Konbini UI. Only WEBP is supported. */
    screenshot_urls: `https://${string}.webp`[];
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
    age_rating: {
        /** Does the app allow to use real currency in any way? */
        money: boolean;
        /** Does the app allow to use unmonitored chats, media reels, whatsoever? */
        social: boolean;
        /** Does the app reference illegal substances or legalized drugs / alcohol in any way? */
        substances: boolean;
        /** Does the app show scenes of real, graphical violence in any case? */
        violence: boolean;
        /** Does the app require the user to grant or deny consent over user data treatment? */
        telemetry: boolean;
    };
}
