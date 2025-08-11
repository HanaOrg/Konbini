import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { globSync } from "glob";
import { parse, stringify } from "yaml";
import { normalize } from "@zakahacecosas/string-utils";
import { isKbiScope, type KONBINI_PKG_SCOPE } from "shared/types/manifest";
import { getPkgRemotes } from "shared/api/getters";
import { parseKps } from "shared/api/manifest";
import { fetchAPI } from "shared/api/network";
import type { MANIFEST_WITH_ID } from "../../gui/src/routes/home";
import { downloadHandler } from "shared/api/download";
import type { KONBINI_ID_PKG } from "shared/types/author";
import { assertIntegrityPGP, assertIntegritySHA } from "shared/security";
import { locateUsr } from "shared/api/core";
import type { KONBINI_HASHFILE } from "shared/types/files";

const SCAN = true;

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
                    // TODO: support GitLab, CodeBerg, and properly detect main branch
                    // use manifest to detect platform
                    // use "default_branch: x" in JSON from these endpoints:
                    // GH - GET /repos/:owner/:repo
                    // GL - GET /projects/:id (reminder, gitlab uses "owner%20repo" type strings)
                    // CB - GET /repos/:owner/:repo
                    await downloadHandler({
                        remoteUrl: `https://raw.githubusercontent.com/${manifest.repository.replace("gh:", "")}/refs/heads/main/CHANGELOG.md`,
                        filePath: `./build/${manifest.id}.changes.md`,
                    });
                } catch (error) {
                    if (String(error).includes("404")) {
                        writeFileSync(`./build/${manifest.id}.changes.md`, "no.");
                        log(`[ ! ] No CHANGELOG file for ${manifest.id}`);
                    }
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

                    if (!existsSync("./build")) mkdirSync("./build");

                    await fetchIfNotExists(files.core, remotes.coreAsset);
                    await fetchIfNotExists(files.core + ".asc", remotes.ascAsset);
                    await fetchIfNotExists(files.base + ".hash.yaml", remotes.shaAsset);
                } catch (error) {
                    err("[XXX] Error downloading assets", error);
                }
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

    logBlock("KONBINI GUARD ENDS");
}

main();
