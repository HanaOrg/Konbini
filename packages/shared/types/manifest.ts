import {
    isValidEmail,
    isValidHexColor,
    validate,
    validateAgainst,
} from "@zakahacecosas/string-utils";
import { parseKps } from "../api/manifest.ts";
import type { KONBINI_ID_USR } from "./author.ts";

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
    "kbi",
] as const;

/** A KPS source. */
export type KPS_SOURCE = (typeof KPS_SOURCES)[number];

export function isKpsSource(str: string | undefined): str is KPS_SOURCE {
    return validateAgainst(str, KPS_SOURCES);
}

export type SPECIFIABLE_KPS_SOURCE = "cho" | "scp" | "fpak" | "brew" | "brew-k";

/** A Konbini Package Scope (KPS). It follows either one of these formats:
 *
 *  `manager:pkg_name`
 *
 *  `manager:pkg_name@url.somewhere/source`
 *
 *  `manager:pkg_name@url.somewhere/source#src-name`
 *
 *  `manager:pkg_name@-#src-name`
 *
 * For a non-Konbini package, the **prefix** represents the package manager and the ***suffix*** the name of the package within that manager.
 * For a Konbini package, the **prefix** declares this as a Konbini package and the ***suffix*** indicates the filename to search for within the release.
 */
export type KONBINI_PKG_SCOPE =
    | `${KPS_SOURCE}:${string}`
    | `apt:${string}@${string}`
    | `${SPECIFIABLE_KPS_SOURCE}:${string}@${string}#${string}`;

/** A parsed KPS. */
export type PARSED_KPS =
    | {
          /** Source. All of them are self-descriptive. */
          src: KPS_SOURCE;
          /** Value. Package ID for the non-Konbini host. */
          value: string;
          /** Command to be executed. */
          cmd: string;
          /** Name of the package manager this package is aliased to. */
          name: string;
      }
    | {
          /** Source. Konbini itself. */
          src: "kbi";
          /** Value. Filename to look for in the Konbini release. */
          value: string;
          /** (null) */
          cmd: null;
          /** (Konbini) */
          name: "Konbini";
      };

/** A parsed KPS containing a srcset. */
export type PARSED_SPECIFIC_KPS = {
    /** Source. */
    src: "apt" | SPECIFIABLE_KPS_SOURCE;
    /** Value. Package ID for the non-Konbini host. */
    value: string;
    /** Command to be executed. */
    cmd: string;
    /** Name of the package manager this package is aliased to. */
    name: string;
    /** @source. */
    at: {
        /** URL of the sourced repo. */
        url: string | null;
        /** If the pkg manager requires it, name of the source. */
        name: string | null;
    };
};

/** A parsed Konbini Package Scope. */
export type KONBINI_PARSED_SCOPE = PARSED_KPS | PARSED_SPECIFIC_KPS;

export const LICENSES = [
    "MIT",
    "LGPLv3",
    "AGPLv3",
    "GPLv3",
    "GPLv2",
    "Apache2",
    "BSD2Clause",
    "BSD3Clause",
    "ISC",
    "MPLv2",
    "EPLv2",
    "Unlicense",
    "Zlib",
    "PublicDomain",
    "ProprietaryLicense",
] as const;

/** These are license _codes_ used by us to identify and define licenses. They should not be used in the UI. */
export type LICENSE = (typeof LICENSES)[number];

/** Turns a license code into a readable string. */
export function humanLicense(license: LICENSE): string {
    switch (license) {
        case "MIT":
            return "MIT License";
        case "AGPLv3":
            return "GNU Affero General Public License v3.0";
        case "GPLv3":
            return "GNU General Public License v3.0";
        case "GPLv2":
            return "GNU General Public License v2.0";
        case "Apache2":
            return "Apache License 2.0";
        case "BSD2Clause":
            return "BSD 2-Clause License";
        case "BSD3Clause":
            return "BSD 3-Clause License";
        case "ISC":
            return "ISC License";
        case "MPLv2":
            return "Mozilla Public License 2.0";
        case "LGPLv3":
            return "GNU Lesser General Public License v3.0";
        case "EPLv2":
            return "Eclipse Public License 2.0";
        case "Unlicense":
            return "The Unlicense";
        case "Zlib":
            return "zlib License";
        case "PublicDomain":
            return "Public domain";
        case "ProprietaryLicense":
            return "Proprietary license";
    }
}

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
    /** Whether the app is a CLI, a graphical app, or has support for both things. */
    type: "cli" | "gui" | "both";
    /** Supported platforms for the package, with their Konbini Package Scope (KPS). */
    platforms: {
        /** 64-bit Linux KPS. */
        linux64: null | KONBINI_PKG_SCOPE;
        /** ARM Linux KPS. */
        linuxArm: null | KONBINI_PKG_SCOPE;
        /** 64-bit / Intel macintoshOS KPS. */
        mac64: null | KONBINI_PKG_SCOPE;
        /** ARM / Apple Silicon macintoshOS KPS. */
        macArm: null | KONBINI_PKG_SCOPE;
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
    author: KONBINI_ID_USR;
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
    requirements?: {
        /** Minimal OS version, if any. */
        os_ver?: {
            win?: string;
            mac?: string;
            lin?: string;
        };
        /** Minimal RAM. */
        ram_mb?: number;
        /** Minimal storage. */
        disk_mb?: number;
    };
    /** App screenshots to be displayed in the Konbini UI. Only WEBP is supported. */
    images?: {
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
    categories?: CATEGORY[];
    /**
     * Age rating of the app. This works by specifying if the following items (which restrict age) are present.
     *
     * For anyone wondering where nudity references are, that kind of content is prohibited from Konbini.
     */
    age_rating: AGE_RATING;
    /** True if the app collects user data, with or without consent. */
    telemetry: boolean;
    /** An accept color for the app in the hexadecimal format.
     * If not provided, Konbini pink is used.
     */
    accent?: `#${string}`;
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

/** Validates if the given scope is a `kbi:` one. */
export function isKbiScope(kps: KONBINI_PKG_SCOPE): kps is `kbi:${string}` {
    if (kps.startsWith("kbi:")) return true;
    return false;
}

/** Validates if the given parsed scope is a specific (`@`-ed) one. */
export function isSpecificParsedKps(
    kps: PARSED_KPS | PARSED_SPECIFIC_KPS,
): kps is PARSED_SPECIFIC_KPS {
    return typeof (kps as any).at === "object";
}

export function isValidManifest(manifest: any): manifest is KONBINI_MANIFEST {
    if (typeof manifest !== "object" || manifest === null) {
        return false;
    }

    const m = manifest as Partial<KONBINI_MANIFEST>;

    const is = (i: any): i is NonNullable<any> => i !== null && i !== undefined;
    const isPlatform = (p: any) => !p || isKps(p);
    const isURL = (s?: any) => validate(s) && s.startsWith("https://");
    const isImageURL = (s?: any) =>
        validate(s) && s.startsWith("https://") && (s.endsWith(".webp") || s.endsWith(".png"));

    const validPlatforms =
        typeof m.platforms === "object" &&
        is(m.platforms) &&
        isPlatform(m.platforms.linux64) &&
        isPlatform(m.platforms.linuxArm) &&
        isPlatform(m.platforms.mac64) &&
        isPlatform(m.platforms.macArm) &&
        isPlatform(m.platforms.win64);

    const validStrings = [m.name, m.slogan, m.desc].every(validate);

    const splitAuthor = (m.author || "").split(".");
    const validAuthorId =
        validate(m.author) &&
        splitAuthor.length == 2 &&
        validateAgainst(splitAuthor[0], ["org", "usr"]) &&
        validate(splitAuthor[1]);

    const validRepository =
        !m.repository || (validate(m.repository) && isRepositoryScope(m.repository));

    const validLicense = !is(m.license) || validateAgainst(m.license, LICENSES);

    const validIcon = !is(m.icon) || isImageURL(m.icon);

    const validAccent = !is(m.accent) || m.accent == undefined || isValidHexColor(m.accent);

    const validMaintainers =
        m.maintainers === undefined ||
        (Array.isArray(m.maintainers) &&
            m.maintainers.every(
                (p) =>
                    typeof p === "object" &&
                    p !== null &&
                    validate(p.name) &&
                    (!p.email || isValidEmail(p.email)) &&
                    (!p.link || validate(p.link)) &&
                    (!p.github || validate(p.github)),
            ));

    const validSysReq =
        !is(m.requirements) ||
        (is(m.requirements) &&
            [m.requirements!.ram_mb, m.requirements!.disk_mb].every(
                (s) => !s || s == undefined || typeof s == "number",
            ) &&
            (!m.requirements!.os_ver ||
                m.requirements!.os_ver == undefined ||
                Object.values(m.requirements!.os_ver).every((s) => typeof s === "string")));

    const validType = validate(m.type) && validateAgainst(m.type, ["cli", "gui", "both"]);

    const validScreenshots =
        m.images === undefined ||
        (Array.isArray(m.images) && m.images.every((i) => isImageURL(i.link) && validate(i.text)));

    const validCategories =
        !is(m.categories) || (Array.isArray(m.categories) && m.categories.every(validate));

    const ar = m.age_rating;
    const validAgeRating =
        typeof ar === "object" &&
        is(ar) &&
        ["money", "social", "substances", "violence"].every(
            (k) => typeof ar?.[k as keyof typeof ar] === "boolean",
        );

    const validHomepage = isURL(m.homepage) || m.homepage === undefined;

    const validDocs = isURL(m.docs) || m.docs === undefined;

    return [
        validPlatforms,
        validStrings,
        validRepository,
        validLicense,
        validIcon,
        validMaintainers,
        validAuthorId,
        validSysReq,
        validScreenshots,
        validCategories,
        validAgeRating,
        validHomepage,
        validDocs,
        validType,
        validAccent,
    ].every((i) => i == true);
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
    /** Main REST API URL. Returns repo details. */
    main: string;
    /** Returns details about ALL releases. */
    all_releases: string;
    /** Returns detail about A SPECIFIC release. **Use this for downloading packages.** */
    release: (tag: string) => string;
    /** Public, frontend URL. */
    public: string;
    /** Public URL that points to a raw file. Getter function that takes the file name and branch. Use a slashed string (a/b) for nested files. */
    file: (branch: string, name: string) => string;
} {
    if (!isRepositoryScope(scope)) throw `Invalid REPOSITORY_SCOPE "${scope}".`;

    const colonSplit = scope.split(":");
    const pref = colonSplit[1]!;
    const slashSplit = pref.split("/");

    if (colonSplit[0] === "gh")
        return {
            source: "gh",
            main: `https://api.github.com/repos/${slashSplit[0]}/${slashSplit[1]}`,
            all_releases: `https://api.github.com/repos/${slashSplit[0]}/${slashSplit[1]}/releases`,
            release: (tag: string) =>
                `https://api.github.com/repos/${slashSplit[0]}/${slashSplit[1]}/releases/tags/${tag}`,
            public: `https://github.com/${slashSplit[0]}/${slashSplit[1]}`,
            file: (branch: string, name: string) =>
                `https://raw.githubusercontent.com/${slashSplit[0]}/${slashSplit[1]}/${branch}/${name}`,
        };
    if (colonSplit[0] === "gl")
        return {
            source: "gl",
            main: `https://gitlab.com/api/v4/projects/${encodeURIComponent(pref)}`,
            all_releases: `https://gitlab.com/api/v4/projects/${encodeURIComponent(pref)}/releases`,
            release: (tag: string) =>
                `https://gitlab.com/api/v4/projects/${encodeURIComponent(pref)}/releases/${tag}`,
            public: `https://gitlab.com/${slashSplit[0]}/${slashSplit[1]}`,
            file: (branch: string, name: string) =>
                `https://gitlab.com/${slashSplit[0]}/${slashSplit[1]}/-/raw/${branch}/${name}`,
        };
    return {
        source: "cb",
        main: `https://codeberg.org/api/v1/repos/${slashSplit[0]}/${slashSplit[1]}`,
        all_releases: `https://codeberg.org/api/v1/repos/${slashSplit[0]}/${slashSplit[1]}/releases`,
        release: (tag: string) =>
            `https://codeberg.org/api/v1/repos/${slashSplit[0]}/${slashSplit[1]}/releases/tags/${tag}`,
        public: `https://codeberg.org/${slashSplit[0]}/${slashSplit[1]}`,
        file: (branch: string, name: string) =>
            `https://codeberg.org/${slashSplit[0]}/${slashSplit[1]}/raw/${branch}/${name}`,
    };
}

/** Supported platforms. */
export type SUPPORTED_PLATFORMS = "linux64" | "linuxArm" | "mac64" | "macArm" | "win64";
