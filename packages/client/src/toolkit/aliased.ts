import { konsole } from "shared/client";
import { execSync } from "child_process";
import { writeLockfile } from "./write";
import { ALIASED_CMDs } from "./alias-cmds";
import { PKG_PATH } from "shared/client";
import { existsSync } from "fs";
import { join } from "path";
import {
    isSpecificParsedKps,
    type KONBINI_MANIFEST,
    type KONBINI_PARSED_SCOPE,
    type KONBINI_PKG_SCOPE,
} from "shared/types/manifest";
import { normalize, validateAgainst } from "@zakahacecosas/string-utils";
import { getPkgManifest } from "shared/api/core";
import { constructKps, parseKps } from "shared/api/manifest";
import { getPlatform } from "shared/api/platform";
import type { KONBINI_LOCKFILE } from "shared/types/files";

/** true if it IS up to date, false if it NEEDS to update */
function isUpToDate(scope: KONBINI_PARSED_SCOPE): boolean {
    if (scope.src === "kbi")
        throw new Error("You should not be able to see this (KBI KPS over alias-only func).");
    const out = execSync(ALIASED_CMDs[scope.src]["exists"](scope.value)).toString();
    // 7.0.0 < 7.0.1
    if (scope.src === "nix") return !out.includes("<");
    // outdated packages:
    // foobar (7.0.1)
    return !out
        .split("\n")
        .map((line) => line.trim())
        .some((line) => line.includes(scope.value));
}

export function installAliasedPackage(params: {
    pkgName: string;
    kps: KONBINI_PARSED_SCOPE;
    manifest: KONBINI_MANIFEST;
    method: "install" | "update" | "reinstall";
}): "upToDate" | "no-op" | "needsPkgMgr" | "installedOrUpdated" {
    const { kps, manifest, pkgName, method } = params;

    // no-op
    if (kps.src === "kbi") return "no-op";

    konsole.adv(
        `${manifest.name} is using ${kps.name}, a non-Konbini remote. We'll ${method} the package for you using '${kps.cmd}'.`,
    );

    try {
        execSync(`${kps.cmd} -v`);
    } catch {
        konsole.err(
            `This package requires "${kps.name}" a 3rd party package manager that is not installed on your system.`,
        );
        return "needsPkgMgr";
    }

    // very specific workaround
    // i've been testing all package managers konbini supports
    // apparently chocolatey is the only idiot that cannot work without elevation
    // apparently windows is the only idiot that doesn't let you do "sudo x" to elevate on the fly
    // so what we have to do is:
    // IF IT'S A WINDOWS USER DOWNLOADING FROM CHOCOLATEY
    if (getPlatform() == "win64" && kps.src === "cho") {
        try {
            // if "net session" fails, we're not an administrator
            execSync("net session");
        } catch {
            // AND RUNNING WITHOUT ELEVATION
            // show a warning
            const conf = konsole.ask(
                `Since this aliased package comes from Chocolatey (package manager that pretty much doesn't work without administrator permissions) and this terminal session is not elevated (or doesn't look like), we recommend you switch to an administrator session and re-run the install command.\nProceed with installation anyway?`,
            );
            if (!conf) return "no-op";
        }
    }

    if (isSpecificParsedKps(kps)) {
        let cmd: ((n: string, u: string) => string) | null = null;
        if (kps.src === "apt") cmd = (n: string) => `sudo add-apt-repository ppa:${n}`;
        if (kps.src === "scp") cmd = (n: string, u: string) => `scoop bucket add ${n} ${u}`;
        if (kps.src === "cho") cmd = (n: string, u: string) => `choco source add -n=${n} -s="${u}"`;
        if (kps.src === "fpak")
            cmd = (n: string, u: string) => `flatpak remote-add --if-not-exists ${n} ${u}`;
        if (validateAgainst(kps.src, ["brew", "brew-k"]))
            cmd = (n: string, u: string) => `brew tap ${n}/${u}`;

        if (typeof cmd !== "function" || !cmd)
            throw `Impossible error, cmd used to handle package's srcset wasn't assigned. Something's wrong (and it's not you).`;

        try {
            const exec = cmd(kps.at.name ?? "", kps.at.url ?? "");
            execSync(normalize(exec));
        } catch (error) {
            konsole.err("Error adding srcset for this package:", error);
            process.exit(1);
        }
    }

    if (isUpToDate(kps)) return "upToDate";

    try {
        execSync(ALIASED_CMDs[kps.src][method](kps.value), {
            // so the user see's what's up
            stdio: "inherit",
        });
    } catch (error) {
        throw `Error installing package '${kps.value}' with ${kps.name}: ${error}`;
    }

    konsole.dbg(
        `Because ${kps.name} is a trusted registry, we don't perform PGP or SHA checks.\nKeep that in mind.`,
    );

    const scope = constructKps(kps);
    if (scope.startsWith("kbi:")) throw `Impossible error? Non-kbi scope became kbi.`;

    const lockfile: KONBINI_LOCKFILE = {
        pkg: pkgName,
        scope: scope as Exclude<KONBINI_PKG_SCOPE, `kbi:${string}`>,
        timestamp: new Date().toString(),
    };
    writeLockfile(lockfile, pkgName, manifest.author);
    return "installedOrUpdated";
}

export async function packageExists(pkg: string): Promise<boolean> {
    const manifest = await getPkgManifest(pkg);
    const { author } = manifest;
    const currentKps = manifest.platforms[getPlatform()];
    const kps = parseKps(currentKps);
    if (kps.src === "kbi") {
        const pkgPath = PKG_PATH({ author, pkg });
        return existsSync(join(pkgPath, kps.value));
    }
    const cmd = ALIASED_CMDs[kps.src]["exists"](kps.value);
    let out: string;

    try {
        out = execSync(cmd).toString().trim();
    } catch (error) {
        out = String(error);
    }

    // chocolatey is stupid...
    if (kps.src === "cho") return out.length === "1 packages installed.".length;
    // NOTE - be sure to test all pkg managers to ensure behavior is consistent
    // (if someone returned 'pkg A not found' this code wouldn't work, that's what i mean)
    // except for chocolatey, I BELIEVE all packages do it the same way (tested it a while ago)
    // if konbini starts messing around with whether a package is installed or not, maybe the solution
    // is to add here a diff behavior for a specific pkg manager
    if (out.includes(kps.value)) return true;
    return false;
}
