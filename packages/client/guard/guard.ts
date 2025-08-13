import { execSync } from "child_process";
import {
    copyFileSync,
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    statSync,
    writeFileSync,
} from "fs";
import { globSync } from "glob";
import { parse, stringify } from "yaml";
import { normalize } from "@zakahacecosas/string-utils";
import {
    isKbiScope,
    parseRepositoryScope,
    type KONBINI_MANIFEST,
    type KONBINI_PKG_SCOPE,
} from "shared/types/manifest";
import { getPkgRemotes } from "shared/api/getters";
import { parseKps } from "shared/api/manifest";
import { fetchAPI } from "shared/api/network";
import type { MANIFEST_WITH_ID } from "../../gui/src/routes/home";
import { downloadHandler } from "shared/api/download";
import type { KONBINI_ID_PKG } from "shared/types/author";
import { assertIntegrityPGP, assertIntegritySHA } from "shared/security";
import { locateUsr } from "shared/api/core";
import type { KONBINI_HASHFILE } from "shared/types/files";
import { getDownloads } from "./downloads";
import { join } from "path";

const SCAN = false;

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
    const base = `./build/${id}_v${n(version)}`;
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

async function fetchAllManifests(): Promise<(MANIFEST_WITH_ID & { url: string })[]> {
    const root = await fetchElement("https://api.github.com/repos/HanaOrg/KonbiniPkgs/contents");
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
            .map((e) => fetch(e.download_url)),
    );
    const promises: [Promise<string>, string][] = finalLevel.map((r) => [
        r.text(),
        `\nid: "${r.url.split("/").slice(-2).join(".").replace(".yaml", "")}"`,
    ]);
    const regularManifests = await Promise.all(promises.map((i) => i[0]!));
    const manifestsWithId = regularManifests.map(
        (s) => s + promises[regularManifests.indexOf(s)]![1],
    );
    return manifestsWithId.map((s) => parse(s));
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
        (s) => !s.endsWith(".md") && !s.endsWith(".yaml") && !s.endsWith(".asc") && existsSync(s),
    );
    log(matches);
    const results: { pkg: string; ver: string; plat: string; res: string }[] = [];
    for (const file of matches) {
        log("[???]", file);
        const [pkg, ver, plat] = file.replace("build/", "").split("_") as [
            string,
            string,
            keyof KONBINI_HASHFILE,
        ];
        const result = execSync("clamdscan --log=./CLAMAV.log " + file);
        const user = pkg.split(".").slice(0, 2).join(".");
        const userAscPath = "build/" + user + ".asc";
        const pkgHashfile = parse(
            readFileSync("build/" + pkg + "_" + ver + ".hash.yaml", "utf-8"),
        ) as KONBINI_HASHFILE;
        const lines = result.toString().split("\n");
        const safety = (
            lines.find((line) => line.startsWith("Infected files:")) ?? "Infected files: 1"
        ).endsWith("0")
            ? "SAFE"
            : "INFECTED";
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
        });
    }
    return results;
}

async function main() {
    logBlock("KONBINI GUARD BEGINS");

    logBlock(
        [
            "WILL     UPDATE KData",
            SCAN ? "WILL     SCAN WITH ClamAV" : "WILL NOT SCAN WITH ClamAV",
        ].join("\n"),
    );

    const GUARD_FILE = "./guard.txt";

    logSection(`Fetching manifests...`);
    const manifests = await fetchAllManifests();
    logSection(`Total manifests: (${manifests.length})`);

    if (SCAN) {
        logSection("Initializing ClamAV Daemon");
        execSync("sudo systemctl start clamav-daemon");

        logSection("Updating DB");
        execSync("sudo freshclam");

        logSection("Clearing guard.txt");
        writeFileSync(GUARD_FILE, `KGuard ${new Date()} | Keeping Konbini safe\n`);
    }

    if (!existsSync("./build")) mkdirSync("build");

    for (const manifest of manifests) {
        try {
            if (!manifest.repository) continue;

            log("[WRK] Fetching", manifest.name);

            if (!existsSync(`./build/${manifest.id}.yaml`))
                writeFileSync(`./build/${manifest.id}.yaml`, stringify(manifest));
            if (!existsSync(`./build/${manifest.id}.changes.md`)) {
                try {
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
                        log(`[ ! ] No CHANGELOG file for ${manifest.id}`);
                    } else {
                        log(`[ ! ] Error reading CHANGELOG for ${manifest.id}: ${error}`);
                    }
                }
            }
            if (!existsSync(`./build/${manifest.id}.downloads.yaml`)) {
                try {
                    log("[|||] Seeking download history for", manifest.repository);
                    writeFileSync(
                        `./build/${manifest.id}.downloads.yaml`,
                        stringify(await getDownloads(manifest.id)),
                    );
                } catch (error) {
                    log(`[ ! ] Error reading downloads for ${manifest.id}: ${error}`);
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
                    remotes = await getPkgRemotes(scope, manifest);
                    files = buildFilenames(scope, manifest.id, remotes.pkgVersion, plat[0]);

                    log("[>>>] REMOTE", remotes);

                    fetches.push([files.core, remotes.coreAsset]);
                    fetches.push([files.core + ".asc", remotes.ascAsset]);
                    fetches.push([files.base + ".hash.yaml", remotes.shaAsset]);
                    writeFileSync("./build/" + manifest.id + ".pa.txt", remotes.pkgReleaseDate);
                } catch (error) {
                    err("[XXX] Error downloading assets", error);
                }
            }

            try {
                const promises = fetches.map((f) => fetchIfNotExists(f[0], f[1]));
                await Promise.all(promises);
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

    if (SCAN) {
        log("[>>>] SCANNING ASSETS");

        const result = await scanFiles();
        result.forEach((i) => {
            writeFileSync(GUARD_FILE, `${i.pkg}@${i.ver}@${i.plat}=${i.res}\n`, {
                encoding: "utf-8",
                flag: "a",
            });
        });
    }

    // kdo = konbini data output
    // i suck at naming stuff alr
    if (!existsSync("./build/kdo")) mkdirSync("./build/kdo");

    const kdata_changelog: Record<
        KONBINI_ID_PKG,
        {
            published_at: string;
            log: string;
        }
    > = {};
    const kdata_downloads: Record<KONBINI_ID_PKG, {}> = {};
    const kdata_manifests: Record<KONBINI_ID_PKG, KONBINI_MANIFEST> = {};
    const kdata_filesizes: Record<KONBINI_ID_PKG, number> = {};

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
            kdata_filesizes[pkg] = statSync(path).size;
            continue;
        }
        const contents = readFileSync(path, "utf-8");
        log("Storing data for", pkg, "from", file.name);
        if (file.name.endsWith(".downloads.yaml")) {
            kdata_downloads[pkg] = parse(contents);
        } else if (file.name.endsWith(".changes.md") && contents.trim() !== "# No") {
            // rudimentary but functional hack
            // validation of format is done later on, dw
            kdata_changelog[pkg] = {
                published_at: readFileSync(join("./build/", pkg) + ".pa.txt", "utf-8"),
                log: "## [" + contents.trim().split("## [")[1],
            };
        } else if (file.name === `${pkg}.yaml`) {
            kdata_manifests[pkg] = parse(contents);
        }
    }

    log("Writing JSON files");
    writeFileSync("build/kdo/kdata_downloads.json", JSON.stringify(kdata_downloads, undefined, 2));
    writeFileSync("build/kdo/kdata_manifests.json", JSON.stringify(kdata_manifests, undefined, 2));
    writeFileSync("build/kdo/kdata_changelog.json", JSON.stringify(kdata_changelog, undefined, 2));
    writeFileSync("build/kdo/kdata_filesizes.json", JSON.stringify(kdata_filesizes, undefined, 2));
    log("Copying to KData source code");
    copyFileSync("build/kdo/kdata_downloads.json", "../../data/api/kdata_downloads.json");
    copyFileSync("build/kdo/kdata_manifests.json", "../../data/api/kdata_manifests.json");
    copyFileSync("build/kdo/kdata_changelog.json", "../../data/api/kdata_changelog.json");
    copyFileSync("build/kdo/kdata_filesizes.json", "../../data/api/kdata_filesizes.json");

    logBlock(`KONBINI GUARD ENDS :D`);
}

main();
