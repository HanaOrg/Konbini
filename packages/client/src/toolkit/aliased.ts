import { konsole } from "shared/client";
import { execSync } from "child_process";
import { writeLockfile } from "./write";
import {
    type KONBINI_LOCKFILE,
    type PARSED_KPS,
    type KONBINI_MANIFEST,
    parseKps,
    getCurrentPlatformKps,
    getPkgManifest,
    constructKps,
    type KONBINI_PKG_SCOPE,
    type KPS_SOURCE,
    getPlatform,
} from "shared";
import { ALIASED_CMDs } from "./alias-cmds";
import { PKG_PATH } from "shared/client";
import { existsSync } from "fs";
import { join } from "path";

function isUpToDate(src: KPS_SOURCE, msg: string): boolean {
    const messages = [
        // winget
        "No newer package versions are available from the configured sources.",
        // apt
        "is already in the newest version",
        // snap
        "has no updates available",
        // brew, brew-k - worth noting this is ambiguous,
        "already installed",
        // flatpak
        "Nothing to do",
        // scoop
        "Latest versions for all apps are installed!",
    ];

    // nix returns an empty string if it's already up to date
    if (src === "nix" && msg.trim().length === 0) return true;
    if (messages.every((s) => !msg.includes(s))) return false;
    return true;
}

export function installAliasedPackage(params: {
    pkgName: string;
    kps: PARSED_KPS;
    manifest: KONBINI_MANIFEST;
    method: "install" | "update" | "reinstall";
}): "upToDate" | "no-op" | "needsPkgMgr" | "installedOrUpdated" {
    const { kps, manifest, pkgName, method } = params;

    // no-op
    if (kps.src === "std") return "no-op";

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

    try {
        const out = execSync(ALIASED_CMDs[kps.src][method](kps.value), {
            // so the user see's what's up
            stdio: "inherit",
        });
        if (isUpToDate(kps.src, out.toString())) return "upToDate";
    } catch (error) {
        if (isUpToDate(kps.src, (error as any).stdout)) return "upToDate";
        throw `Error installing package '${kps.value}' with ${kps.name}: ${error}`;
    }

    konsole.dbg(
        `Because ${kps.name} is a trusted registry, we don't perform PGP or SHA checks.\n      Keep that in mind.`,
    );

    const scope = constructKps(kps);
    if (scope.startsWith("std:")) throw `Impossible error? Non-std scope became std.`;

    const lockfile: KONBINI_LOCKFILE = {
        pkg: pkgName,
        scope: scope as Exclude<KONBINI_PKG_SCOPE, `std:${string}`>,
        installation_ts: new Date().toString(),
    };
    writeLockfile(lockfile, pkgName, manifest.author_id);
    return "installedOrUpdated";
}

export async function packageExists(pkg: string): Promise<boolean> {
    const manifest = await getPkgManifest(pkg);
    const { author_id } = manifest;
    const currentKps = getCurrentPlatformKps(manifest.platforms)!;
    const kps = parseKps(currentKps);
    if (kps.src === "std") {
        const pkgPath = PKG_PATH({ author: author_id, pkg });
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
