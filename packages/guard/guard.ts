import { execSync } from "child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { globSync } from "glob";
import { normalize } from "@zakahacecosas/string-utils";
import {
    CATEGORIES,
    isKbiScope,
    parseRepositoryScope,
    type CATEGORY,
    type KONBINI_PKG_SCOPE,
    type SUPPORTED_PLATFORMS,
} from "shared/types/manifest";
import { getPkgRemotes } from "shared/api/getters";
import { parseKps } from "shared/api/manifest";
import { fetchAPI } from "shared/api/network";
import { downloadHandler } from "shared/api/download";
import type { KONBINI_AUTHOR, KONBINI_ID_PKG, KONBINI_ID_USR } from "shared/types/author";
import { assertIntegrityPGP, assertIntegritySHA, konbiniHash } from "shared/security";
import { locateUsr } from "shared/api/core";
import type { KONBINI_HASHFILE } from "shared/types/files";
import { getDownloads } from "./fetch";
import { join } from "path";
import type {
    MANIFEST_WITH_ID,
    KDATA_FILE_PKG,
    KDATA_ENTRY_PKG,
    DownloadData,
} from "shared/types/kdata";
import { parseKAChangelog } from "shared/changelog";

function log(...a: any[]): void {
    console.log(...a);
}
function err(...a: any[]): void {
    console.error(...a);
}

type Element =
    | { type: "dir"; url: string; download_url: null }
    | { type: "file"; url: string; download_url: string };

function logSection(title: string) {
    log("=".repeat(5), title.toUpperCase(), "=".repeat(5));
}

function logBlock(title: string) {
    log("=".repeat(50) + "\n" + title.toUpperCase() + "\n" + "=".repeat(50));
}

function buildFilenames(scope: KONBINI_PKG_SCOPE, id: KONBINI_ID_PKG, version: string, os: string) {
    const n = (s: string) => normalize(s, { preserveCase: true });
    const { value } = parseKps(scope);
    const base = `./build/${id}_${n(version)}`;
    const core = `${base}_${os}_${value}`;
    return {
        base,
        core,
    };
}

async function fetchElement(url: string): Promise<Element[]> {
    const res = await fetchAPI(url);
    if (!res.ok) throw `GitHub fetch failed: ${res.statusText}`;
    return (await res.json()) as Element[];
}

async function fetchAllManifests(kind: "Pkgs"): Promise<MANIFEST_WITH_ID[]>;
async function fetchAllManifests(kind: "Authors"): Promise<(KONBINI_AUTHOR & { id: string })[]>;
async function fetchAllManifests(
    kind: "Pkgs" | "Authors",
): Promise<MANIFEST_WITH_ID[] | (KONBINI_AUTHOR & { id: string })[]> {
    const root = await fetchElement(`https://api.github.com/repos/HanaOrg/Konbini${kind}/contents`);
    const firstLevel = await Promise.all(
        root.filter((e) => e.type === "dir").map((d) => fetchElement(d.url)),
    );
    const secondLevel = await Promise.all(
        firstLevel
            .flat()
            .filter((e) => e.type === "dir")
            .map((d) => fetchElement(d.url)),
    );
    const finalLevel = await Promise.all(
        secondLevel
            .flat()
            .filter((e) => e.type === "file")
            .filter((e) => !e.download_url.includes(".asc"))
            .map((e) => fetch(e.download_url)),
    );
    const promises: [Promise<string>, string][] = finalLevel.map((r) => [
        r.text(),
        `\nid: "${
            kind === "Pkgs"
                ? r.url.split("/").slice(-2).join(".").replace(".yaml", "")
                : `${r.url.split("/").slice(-3)[0]}.${r.url.split("/").slice(-3)[2]!.replace(".yaml", "")}`
        }"`,
    ]);
    const regularManifests = await Promise.all(promises.map((i) => i[0]!));
    const manifestsWithId = regularManifests.map(
        (s) => s + promises[regularManifests.indexOf(s)]![1],
    );
    return manifestsWithId.map((s) => Bun.YAML.parse(s) as MANIFEST_WITH_ID);
}

async function fetchIfNotExists(filename: string, assetUrl: string) {
    if (existsSync(filename)) return;
    log("[···] Fetching", assetUrl, "for", filename);
    const response = await fetchAPI(assetUrl);
    if (!response.ok) throw `Failed to fetch ${assetUrl}: ${response.statusText}`;
    const arrayBuffer = await response.arrayBuffer();
    writeFileSync(filename, new Uint8Array(arrayBuffer));
}

async function scanFiles() {
    const matches = globSync("./build/*").filter(
        (s) =>
            !s.endsWith(".md") &&
            !s.endsWith(".yaml") &&
            !s.endsWith(".asc") &&
            !s.endsWith(".pa.txt") &&
            !s.endsWith(".lt.txt") &&
            existsSync(s),
    );
    log(matches);
    const results: { pkg: string; ver: string; plat: string; res: string; hash: string }[] = [];
    for (const file of matches) {
        log("[???]", file);
        const [pkg, ver, plat] = file.replace("build/", "").split("_") as [
            string,
            string,
            keyof KONBINI_HASHFILE,
        ];
        const result = execSync(`sudo clamscan --stdout ${file}`);
        const user = pkg.split(".").slice(0, 2).join(".");
        const userAscPath = "build/" + user + ".asc";
        const pkgHashfile = Bun.YAML.parse(
            readFileSync("build/" + pkg + "_" + ver + ".hash.yaml", "utf-8"),
        ) as KONBINI_HASHFILE;
        const resString = result.toString();
        console.debug(`[DBG] RES FOR sudo clamscan --stdout --quiet ${file}\n${resString}`);
        const line = resString.split("\n").find((line) => line.startsWith("Infected files:"));
        const safety = line ? (line.endsWith("0") ? "SAFE" : "INFECTED") : "ERROR";
        await fetchIfNotExists(userAscPath, locateUsr(user).signature);
        const signature =
            (await assertIntegrityPGP({
                executableFilePath: file,
                executableAscFilePath: file + ".asc",
                authorAscFilePath: userAscPath,
            })) === "valid"
                ? "AUTHENTIC"
                : "UNAUTHENTIC";
        const hash = assertIntegritySHA(file, pkgHashfile[plat] ?? "") ? "INTEGRAL" : "CORRUPTED";
        const res = [safety, signature, hash].join("|");
        log("[RES]", file, res);
        results.push({
            pkg,
            plat,
            ver,
            res,
            hash: konbiniHash(file),
        });
    }
    return results;
}

/**
 * Creates a new object by sorting an existing one.
 *
 * @param {*} o Object to sort.
 * @param {*} sorter Sorting function.
 * @returns {*}
 */
function fromSorting<T extends Record<any, any>>(o: T, sorter: any): T {
    return Object.fromEntries(Object.entries(o).sort(sorter)) as T;
}

async function main() {
    logBlock("コンビニ GUARD BEGINS");

    logSection(import.meta.env["BEARER"] ? "LOADED BEARER :D" : "DID NOT LOAD BEARER!");

    logBlock("コンビニ GUARD // PREFETCH // BEGINS");

    logSection(`Fetching manifests...`);
    const manifests = await fetchAllManifests("Pkgs");
    const authors = await fetchAllManifests("Authors");
    logSection(`Fetched all manifests [${manifests.length} PKGS | ${authors.length} AUTHORS]`);

    const date = new Date();

    /* logSection("Updating ClamAV database");
    execSync("freshclam --datadir=/tmp/clamav --stdout --quiet"); */

    logSection("Clearing guard.txt");
    writeFileSync("./guard.txt", `コンビニ | KGuard ${date} | Keeping Konbini safe\n`);

    if (!existsSync("./build")) mkdirSync("build");

    logBlock("コンビニ GUARD // PREFETCH // SUCCESSFULLY ENDS");

    logBlock("コンビニ GUARD // MANIFEST LOOP // BEGINS");

    for (const manifest of manifests) {
        try {
            log("[WRK] Fetching", manifest.name);

            if (!existsSync(`./build/${manifest.id}.yaml`))
                writeFileSync(`./build/${manifest.id}.yaml`, Bun.YAML.stringify(manifest));
            if (!existsSync(`./build/${manifest.id}.changes.md`)) {
                try {
                    if (!manifest.repository) throw "404";
                    const scope = parseRepositoryScope(manifest.repository);
                    const branch: string = (await (await fetchAPI(scope.main)).json())
                        .default_branch;
                    log(
                        "[|||] Seeking CHANGELOG.md from",
                        manifest.repository,
                        "on branch",
                        branch,
                    );
                    await downloadHandler({
                        remoteUrl: scope.file(branch, "CHANGELOG.md"),
                        filePath: `./build/${manifest.id}.changes.md`,
                    });
                } catch (error) {
                    if (String(error).includes("404")) {
                        writeFileSync(`./build/${manifest.id}.changes.md`, "# No");
                        log(`[ / ] No CHANGELOG file for ${manifest.id}`);
                    } else {
                        log(`[ ! ] Error seeking CHANGELOG for ${manifest.id}: ${error}`);
                    }
                }
            }
            if (!existsSync(`./build/${manifest.id}.downloads.yaml`)) {
                try {
                    log("[|||] Seeking download history for", manifest.name);
                    writeFileSync(
                        `./build/${manifest.id}.downloads.yaml`,
                        Bun.YAML.stringify(await getDownloads(manifest.id)),
                    );
                } catch (error) {
                    log(`[ ! ] Error seeking downloads for ${manifest.id}: ${error}`);
                }
            }

            log("[WRK] Analyzing", manifest.name);

            let files;
            let remotes;

            const platforms = Object.entries(manifest.platforms);

            if (platforms.every((p) => !p[1] || !isKbiScope(p[1]))) {
                log("[<<<] TRUSTED PACKAGE", manifest.name);
                continue;
            }

            const fetches: [string, string][] = [];

            for (const plat of Object.entries(manifest.platforms)) {
                const scope = plat[1];
                if (!scope || !isKbiScope(scope)) {
                    log("[<<<] TRUSTED ASSET", plat);
                    continue;
                }

                log("[>>>] ASSET", plat, "ON SCOPE", scope);

                try {
                    remotes = await getPkgRemotes(scope, manifest, 0);
                    files = buildFilenames(scope, manifest.id, remotes.pkgVersion, plat[0]);

                    log("[>>>] REMOTE", remotes);

                    fetches.push([files.core, remotes.coreAsset]);
                    fetches.push([files.core + ".asc", remotes.ascAsset]);
                    fetches.push([files.base + ".hash.yaml", remotes.shaAsset]);
                    // published-at
                    writeFileSync("./build/" + manifest.id + ".pa.txt", remotes.pkgReleaseDate);
                    // latest-tag
                    writeFileSync("./build/" + manifest.id + ".lt.txt", remotes.pkgVersion);
                } catch (error) {
                    err("[XXX] Error downloading assets", error);
                }
            }

            try {
                // ik promise.all() exists, but it kinda gives problems here
                for (const toFetch of fetches) await fetchIfNotExists(toFetch[0], toFetch[1]);
            } catch (error) {
                err("[XXX] Error downloading assets", error);
            }

            if (!files) {
                log("[XXX] No scannable assets for", manifest.name);
                continue;
            }

            if (!remotes) {
                err("[XXX] No valid remotes found for", manifest.name);
                continue;
            }

            await fetchIfNotExists(files.base + ".hash.yaml", remotes.shaAsset);
        } catch (e) {
            err("[XXX] ERROR GETTING ASSETS TO BE SCANNED:", e);
        }
    }

    logBlock("コンビニ GUARD // MANIFEST LOOP // SUCCESSFULLY ENDS");

    logBlock("コンビニ GUARD // AV SCAN // BEGINS");

    const result = await scanFiles();
    result.forEach((i) => {
        writeFileSync("./guard.txt", `${i.pkg}@${i.ver}@${i.plat}@${i.hash}=${i.res}\n`, {
            encoding: "utf-8",
            flag: "a",
        });
    });

    logBlock("コンビニ GUARD // AV SCAN // SUCCESSFULLY ENDS");

    logBlock("コンビニ GUARD // KDATA // BEGINS");

    const kdata: KDATA_FILE_PKG = {};

    for (const file of readdirSync("./build", { withFileTypes: true })) {
        if (
            !file.isFile() ||
            file.name.endsWith(".asc") ||
            file.name.endsWith(".hash.yaml") ||
            file.name.endsWith(".pa.txt")
        )
            continue;
        const pkg = file.name.split(".").slice(0, 3).join(".") as KONBINI_ID_PKG;
        const path = join(file.parentPath, file.name);
        const isBinary =
            file.name.includes("linux64") ||
            file.name.includes("linuxArm") ||
            file.name.includes("mac64") ||
            file.name.includes("macArm") ||
            file.name.includes("win64");
        if (isBinary) {
            log("Storing", file.name, "release size");
            if (!kdata[pkg.split("_")[0]! as KONBINI_ID_PKG]) {
                kdata[pkg.split("_")[0]! as KONBINI_ID_PKG] = {} as any;
            }
            if (!kdata[pkg.split("_")[0]! as KONBINI_ID_PKG]!["filesizes"]) {
                kdata[pkg.split("_")[0]! as KONBINI_ID_PKG]!["filesizes"] = {} as any;
            }
            kdata[pkg.split("_")[0]! as KONBINI_ID_PKG]!["filesizes"][
                path.split("_")[2]! as SUPPORTED_PLATFORMS
            ] = statSync(path).size;
            continue;
        }
        const contents = readFileSync(path, "utf-8");
        log("Storing data for", pkg, "from", file.name);
        if (file.name.endsWith(".downloads.yaml")) {
            if (!kdata[pkg]) kdata[pkg] = {} as any;
            kdata[pkg]!["downloads"] = Bun.YAML.parse(contents) as DownloadData;
        } else if (file.name.endsWith(".changes.md") && contents.trim() !== "# No") {
            if (!kdata[pkg]) kdata[pkg] = {} as any;
            kdata[pkg]!["last_release_at"] = readFileSync(
                join("./build/", pkg) + ".pa.txt",
                "utf-8",
            );
            const log = parseKAChangelog(contents);
            if (log) kdata[pkg]!["changelog"] = log;
            kdata[pkg]!["latest_release"] = readFileSync(
                join("./build/", pkg) + ".lr.txt",
                "utf-8",
            );
        } else if (file.name === `${pkg}.yaml`) {
            if (!kdata[pkg]) kdata[pkg] = {} as any;
            kdata[pkg] = {
                ...kdata[pkg],
                ...(Bun.YAML.parse(contents) as KDATA_ENTRY_PKG),
            };
        }
    }

    const sortByDownloads = (a: [string, KDATA_ENTRY_PKG], b: [string, KDATA_ENTRY_PKG]) =>
        (b[1]?.downloads?.active ?? 0) - (a[1]?.downloads?.active ?? 0);
    const sortByLastUpdate = (a: [string, KDATA_ENTRY_PKG], b: [string, KDATA_ENTRY_PKG]) =>
        new Date(b[1].last_release_at ?? 0).getTime() -
        new Date(a[1].last_release_at ?? 0).getTime();
    const createCategoryGroup = (c: CATEGORY): [CATEGORY, KDATA_FILE_PKG] => [c, {}];

    const sortedByDownloads = fromSorting(kdata, sortByDownloads);
    // (Partial<> since now that Konbini is a new thing, not all categories may be defined)
    const groupedByCategories: Partial<Record<CATEGORY, KDATA_FILE_PKG>> = Object.fromEntries(
        CATEGORIES.map(createCategoryGroup),
    );
    Object.entries(kdata).forEach((e) =>
        (e[1].categories || []).forEach((cat) => {
            if (!groupedByCategories[cat]) {
                groupedByCategories[cat] = {};
            }
            groupedByCategories[cat][e[0] as KONBINI_ID_PKG] = e[1];
        }),
    );
    const sortedByLastUpdate = fromSorting(kdata, sortByLastUpdate);
    const sortedAuthors: Record<KONBINI_ID_USR, KONBINI_AUTHOR> = Object.fromEntries(
        authors.map((a) => [a.id, a]),
    );
    const groupedByAuthors: Record<
        KONBINI_ID_USR,
        Record<KONBINI_ID_PKG, KDATA_ENTRY_PKG>
    > = Object.fromEntries(authors.map((a) => [a.id, {}]));
    Object.entries(kdata).forEach(([user, m]) => {
        if (!groupedByAuthors[m.author]) groupedByAuthors[m.author] = {};
        groupedByAuthors[m.author]![user as KONBINI_ID_PKG] = m;
    });

    const guardJson = {
        date: date.toISOString(),
        results: Object.fromEntries(
            readFileSync("./guard.txt", { encoding: "utf-8" })
                .split("\n")
                .filter((l) => l.trim() !== "")
                .slice(1)
                .map((l) => {
                    const [pkg, ver, plat, _hash] = l.split("@");
                    if (!_hash) return [];
                    if (!plat) return [];

                    const hash = _hash.split("=");
                    if (!hash[1]) return [];
                    const res = hash[1].split("|");

                    return [
                        `${pkg}@${plat}`,
                        {
                            safe: res[0] === "SAFE",
                            authentic: res[1] === "AUTHENTIC",
                            integral: res[2] === "INTEGRAL",
                            hash: hash[0],
                            ver,
                        },
                    ];
                }),
        ),
    };

    writeFileSync("../data/api/kdata_per_author_id.json", JSON.stringify(groupedByAuthors));
    writeFileSync("../data/api/kdata_per_downloads.json", JSON.stringify(sortedByDownloads));
    writeFileSync("../data/api/kdata_per_category.json", JSON.stringify(groupedByCategories));
    writeFileSync("../data/api/kdata_per_releases.json", JSON.stringify(sortedByLastUpdate));
    writeFileSync("../data/api/kdata_authors.json", JSON.stringify(sortedAuthors));
    writeFileSync("../data/api/guard_res.json", JSON.stringify(guardJson));

    logBlock("コンビニ GUARD // KDATA // SUCCESSFULLY ENDS");

    logBlock(`コンビニ SUCCESSFULLY ENDS GUARDING, BALLER :D`);
}

main();
