// this file is a bit of a mess you know

import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { globSync } from "glob";
import { parse } from "yaml";
import { KPI } from "../src/api/core";
import { normalize } from "@zakahacecosas/string-utils";
import type { KONBINI_MANIFEST, KONBINI_PKG_SCOPE } from "../src/types/manifest";
import type { GRA_RELEASE } from "../src/types/github";
import { getCurrentPlatformKps, parseKps } from "../src/api/manifest";
import { fetchAPI } from "../src/api/fetch";

type gh_elem =
    | { type: "dir"; url: string; download_url: null }
    | { type: "file"; url: string; download_url: string };

function logSection(title: string) {
    console.log("=".repeat(5), title.toUpperCase(), "=".repeat(5));
}

function logBlock(title: string) {
    console.log("=".repeat(50) + "\n" + title.toUpperCase() + "\n" + "=".repeat(50));
}

function buildFilenames(scope: KONBINI_PKG_SCOPE, version: string) {
    const n = (s: string) => normalize(s, { preserveCase: true });
    const { src: platform, val: pkgName } = parseKps(scope);
    const base = `./guard/build/PKG__${n(pkgName)}`;
    const core = `${base}__SRC__${n(platform)}__V__${n(version)}`;
    return {
        base,
        core,
    };
}

async function gh_fetch_elem(url: string): Promise<gh_elem[]> {
    const res = await fetchAPI(url);
    if (!res.ok) throw new Error(`GitHub fetch failed: ${res.statusText}`);
    return (await res.json()) as gh_elem[];
}

async function fetchAllManifests(): Promise<string[]> {
    const dirs = (
        await gh_fetch_elem("https://api.github.com/repos/HanaOrg/KonbiniPkgs/contents")
    ).filter((e) => e.type === "dir");
    const allPkgs = (await Promise.all(dirs.map((d) => gh_fetch_elem(d.url))))
        .flat()
        .filter((e) => e.type === "file");
    const rawManifests = await Promise.all(
        (await Promise.all(allPkgs.map((e) => fetch(e.download_url!)))).map((r) => r.text()),
    );
    return rawManifests;
}

function ensureGuardFile(path: string): string {
    if (!existsSync(path)) {
        console.log("[INF] Using no guard file");
        writeFileSync(path, "", { encoding: "utf-8" });
    } else {
        console.log("[INF] Using earlier guard file");
    }
    return readFileSync(path, { encoding: "utf-8" });
}

async function writeFileIfNotExists(filename: string, assetUrl: string) {
    if (existsSync(filename)) return;
    const response = await fetchAPI(assetUrl);
    if (!response.ok) throw new Error(`Failed to fetch ${assetUrl}`);
    const arrayBuffer = await response.arrayBuffer();
    writeFileSync(filename, new Uint8Array(arrayBuffer));
}

function scanBuildFiles() {
    const matches = globSync("./guard/build/**").filter(
        (s) => !s.endsWith("/build") && !s.endsWith("\\build"),
    );
    console.debug(matches);
    const results: { pkg: string; ver: string; plat: string; secure: boolean }[] = [];
    for (const file of matches) {
        console.debug("[???]", file);
        if (!existsSync(file)) continue;
        if (file.endsWith(".asc") || file.endsWith(".yaml")) continue;
        const result = execSync("clamdscan " + file);
        // TODO - uhh, we'll have to sort this out
        // const hash = KbiSecSHA.assertIntegrity(file,
        //     (parse(readFileSync(file + ".hash.yaml", "utf-8")))[]
        // );
        const lines = result.toString().split("\n");
        const isSafe = (
            lines.find((line) => line.startsWith("Infected files:")) ?? "Infected files: 1"
        ).endsWith("0");
        console.log("[RES]", file, isSafe ? "SAFE." : "INFECTED.");
        const splitted = file.split("./guard/build/").filter(Boolean).join("").split("__");
        results.push({
            pkg: splitted[1]!,
            plat: splitted[3]!,
            ver: splitted[5]!,
            secure: isSafe,
        });
    }
    return results;
}

async function main() {
    const IRL = (
        (await fetchAPI("https://api.github.com/repos/HanaOrg/KonbiniPkgs/contents")) as any
    ).message?.includes("rate limit");

    if (IRL) throw new Error("Rate limited by GitHub.");

    logBlock("KONBINI GUARD ClamAV SCAN BEGINS");

    const GUARD_FILE_PATH = "./guard/GUARD_FILE.guard.konbini";
    const GUARD_TEXT = ensureGuardFile(GUARD_FILE_PATH);

    const manifests = await fetchAllManifests();
    logSection(`Fetched manifests (${manifests.length})`);

    logSection("Initializing ClamAV Daemon");
    execSync("sudo systemctl start clamav-daemon");

    for (const manifest of manifests) {
        try {
            const m = parse(manifest) as KONBINI_MANIFEST;

            const [owner, repo] = m.repository.split("/");
            const release = await fetchAPI(
                `https://api.github.com/repos/${owner}/${repo}/releases`,
            );
            const releases = await release.json();
            const ver = (releases as GRA_RELEASE[])[0]?.tag_name;

            console.log("[WRK] Seeking", `${m.name}@${ver}`);

            if (
                GUARD_TEXT.includes(`${m.name}@${ver}@${getCurrentPlatformKps(m.platforms)}=VALID`)
            ) {
                console.log("[SKP] KONBINI PKG", m.name, "ALREADY VALIDATED. CAN SKIP.");
                continue;
            } else {
                console.log("[WRK] KONBINI PKG", m.name, "WILL BE SCANNED");
            }

            let f;
            let r;

            for (const plat of Object.entries(m.platforms)) {
                const scope = plat[1];
                if (!scope) {
                    console.log("[<<<] ASSET", plat, "SKIPPED");
                    continue;
                }
                if (parseKps(scope).src !== "std") {
                    console.log("[<<<] ASSET", plat, "TRUSTED");
                    continue;
                }

                console.log("[>>>] ASSET", plat, "SCOPED", scope);

                try {
                    r = await KPI.pkgRemotes(scope, m);
                    f = buildFilenames(scope, r.pkgVersion);

                    console.debug("[>>>] REMOTE", r);

                    if (!existsSync("./guard/build")) mkdirSync("./guard/build");

                    await writeFileIfNotExists(f.core, r.coreAsset);
                } catch (error) {
                    console.error("[XXX] Error downloading assets", error);
                }
            }

            if (!f) {
                console.error("[XXX] No valid assets found for", m.name);
                continue;
            }

            if (!r) {
                console.error("[XXX] No valid remotes found for", m.name);
                continue;
            }

            await writeFileIfNotExists(f.base + ".hash.yaml", r.shaAsset);
            await writeFileIfNotExists(f.base + ".asc", r.ascAsset);
        } catch (err) {
            console.error("[XXX] ERROR GETTING ASSETS TO BE SCANNED:", err);
        }
    }

    console.log("[>>>] SCANNING ASSETS");
    const result = scanBuildFiles();
    result.map((i) => {
        writeFileSync(
            GUARD_FILE_PATH,
            `${readFileSync(GUARD_FILE_PATH)}\n${i.pkg}@${i.ver}@${i.plat}=${i.secure ? "VALID" : "INVALID"}\n`
                .split("\n")
                .filter(Boolean)
                .join("\n"),
            { encoding: "utf-8" },
        );
    });

    logBlock("KONBINI GUARD ClamAV SCAN ENDS");
}

main();
