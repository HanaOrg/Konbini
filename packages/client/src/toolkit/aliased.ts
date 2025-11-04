import { konsole } from "shared/client";
import { execSync } from "child_process";
import { writeLaunchpadShortcut, writeLockfile } from "./write";
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
import { constructKps, parseKps } from "shared/api/manifest";
import { getPlatform } from "shared/api/platform";
import type { KONBINI_LOCKFILE } from "shared/types/files";
import { installPkgMgr } from "./ipm";
import { exists } from "./exists";
import type { KONBINI_ID_PKG, KONBINI_ID_USR } from "shared/types/author";
import { isTpm, trustPackageManager } from "./tpm";
import { logAction } from "shared/api/kdata";

/** true if it IS up to date, false if it NEEDS to update */
function isUpToDate(scope: KONBINI_PARSED_SCOPE): boolean {
    if (scope.src === "kbi")
        throw "You should not be able to see this (KBI KPS over alias-only func).";
    let out: string[];
    try {
        out = execSync(ALIASED_CMDs[scope.src]["check"](scope.value)).toString().split("\n");
    } catch (error) {
        out = new TextDecoder().decode((error as any).stdout ?? String(error)).split("\n");
    }
    // foobar 7.0.0 < 7.0.1
    if (scope.src === "nix") return !out.includes("<");
    // outdated packages: foobar (7.0.1)
    return !out.some((line) => line.includes(scope.value));
}

export async function installAliasedPackage(params: {
    pkgId: KONBINI_ID_PKG | `kbi.grabbed.${string}`;
    kps: KONBINI_PARSED_SCOPE;
    manifest: KONBINI_MANIFEST;
    method: "install" | "update" | "reinstall";
}): Promise<"upToDate" | "no-op" | "needsPkgMgr" | "installedOrUpdated"> {
    const { kps, manifest, pkgId, method } = params;

    // no-op
    if (kps.src === "kbi") return "no-op";

    konsole.adv(
        `${manifest.name} is using ${kps.name}, a non-Konbini remote. We'll ${method} the package for you using '${kps.cmd}'.`,
    );
    if (!isTpm(kps.src)) {
        konsole.war(
            `Hold up: ${kps.name} is untrusted. This is because you're either\n- using it via Konbini for the 1st time\n- you've chose not to trust it last time it showed up\n- (rare) the file where we keep track of trusted managers is gone/unreadable\n`,
        );
        const out = konsole.ask(`Do you wish to trust ${kps.name}?`);
        if (!out) {
            konsole.suc(
                "Alright then, installation won't proceed.\nNext time you try to install from this source, you'll see the same prompt.\nTo view trusted package managers or to trust/untrust anything anytime, run 'kbi tpm'.",
            );
            process.exit(0);
        } else {
            trustPackageManager(kps.src);
            konsole.suc(
                `Gotcha, ${kps.name} is now trusted; any package from there will just install\nTo view trusted package managers or to untrust ${kps.name} anytime, run 'kbi tpm'.`,
            );
        }
    }

    if (!exists(kps.cmd)) {
        konsole.err(
            `This package requires "${kps.name}", a 3rd party package manager that is not installed on your system.`,
        );
        if (kps.src === "brew" || kps.src === "brew-k") {
            konsole.dbg(
                "If brew is installed, you're running with sudo, and this appears, try again without sudo, it might work that way.\nIf it works that way, report this as a bug.",
            );
        }
        if (kps.src === "fpak") return "needsPkgMgr";
        konsole.war(
            "We can attempt to install it for you, to make your life easier.\nKeep in mind this is not 100% stable and somewhat error prone.\nPlus, what we do is bringing here the installer, so you might still need to input some stuff yourself.",
        );
        const install = konsole.ask("Should we try to?");
        if (!install) {
            konsole.war(
                "OK. Install it yourself, then. Thanks to Konbini that'll likely be the only time you have touch it ;).",
            );
            process.exit(1);
        }
        try {
            const out = installPkgMgr(kps.src);
            if (out === "edge") throw `Edge case: Shouldn't ${kps.name} be preinstalled?`;
            konsole.suc(
                "Installed. Now restart your terminal, then re-run 'kbi install' and it should work!",
            );
            process.exit(0);
        } catch (error) {
            throw `Error installing ${kps.name}`;
        }
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

    if (method === "update" && isUpToDate(kps)) return "upToDate";

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
        pkg_id: pkgId,
        scope: scope as Exclude<KONBINI_PKG_SCOPE, `kbi:${string}`>,
        timestamp: new Date().toString(),
    };
    writeLockfile(lockfile, pkgId, manifest.author);
    konsole.dbg("Lockfile written.");
    if (!pkgId.startsWith("kbi."))
        writeLaunchpadShortcut(pkgId as KONBINI_ID_PKG, manifest.author, "", scope);

    if (method === "install") {
        const res = await logAction({
            app: pkgId,
            // TODO: make this show actual version
            // and add a separate source field
            version: kps.name,
            action: "download",
        });
        if (res.status == 429)
            konsole.dbg(
                "Uhh... You're using Konbini a bit too much. Your actions won't count towards download counts for a while (HTTP 429).",
            );
        else konsole.dbg("Telemetry data written.");
    }

    return "installedOrUpdated";
}

export function packageExists(pkg: KONBINI_PKG_SCOPE, author?: KONBINI_ID_USR): boolean {
    const kps = parseKps(pkg);
    if (kps.src === "kbi") {
        if (!author)
            throw "Internal error: Attempt to check for existence of Konbini package without USR ID.";
        const pkgPath = PKG_PATH({ author, pkg });
        return existsSync(join(pkgPath, kps.value));
    }
    const cmd = ALIASED_CMDs[kps.src]["exists"](kps.value);
    let out: string;

    try {
        out = execSync(cmd).toString();
    } catch (error) {
        out = new TextDecoder().decode((error as any).stdout ?? String(error));
    }

    // NOTE - be sure to test all pkg managers to ensure behavior is consistent
    // (if someone returned 'pkg A not found' this code wouldn't work, that's what i mean)
    // I BELIEVE all packages do it the same way (tested it a while ago)
    // if konbini starts messing around with whether a package is installed or not, maybe the solution
    // is to add here a diff behavior for a specific pkg manager
    if (out.includes(kps.value)) return true;
    return false;
}
