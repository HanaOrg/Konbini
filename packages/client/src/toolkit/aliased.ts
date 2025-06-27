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
} from "shared";
import { ALIASED_CMDs } from "./alias-cmds";
import { PKG_PATH } from "shared/client";
import { existsSync } from "fs";

function noNewUpdates(errorMsg: string): boolean {
    // TODO - the rest

    // WinGet
    if (errorMsg.includes("No newer package versions are available from the configured sources."))
        return true;

    return false;
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

    const name = kps.src.toUpperCase();

    konsole.adv(
        `${manifest.name} is using ${name}, a non-Konbini remote. We'll ${method} the package for you using '${kps.cmd}'.`,
    );

    try {
        execSync(`${kps.cmd} -v`);
    } catch {
        konsole.err(
            `This package requires a 3rd party package manager that is not installed on your system.`,
        );
        return "needsPkgMgr";
    }

    try {
        execSync(ALIASED_CMDs[kps.src][method](kps.val));
    } catch (error) {
        if (noNewUpdates((error as any).stdout)) {
            konsole.suc(`${manifest.name} is already up to date!`);
            return "upToDate";
        }
        throw `Error installing package '${kps.val}' with ${name}: ${error}`;
    }

    konsole.dbg(
        `Because ${name} is a trusted registry, we don't perform PGP or SHA checks.\n      Keep that in mind.`,
    );

    const scope = constructKps(kps);
    if (scope.startsWith("std:")) throw `a`;

    const lockfile: KONBINI_LOCKFILE = {
        pkg: pkgName,
        scope: scope as Exclude<KONBINI_PKG_SCOPE, `std:${string}`>,
        installation_ts: new Date().toString(),
    };
    writeLockfile(lockfile, pkgName, manifest.author_id);
    return "installedOrUpdated";
}

export async function existsAliasedPackage(pkg: string): Promise<boolean> {
    const manifest = await getPkgManifest(pkg);
    const { author_id } = manifest;
    const kps = parseKps(getCurrentPlatformKps(manifest.platforms));
    if (kps.src === "std") {
        return existsSync(PKG_PATH({ author: author_id, pkg }));
    }
    const cmd = ALIASED_CMDs[kps.src]["exists"](kps.val);
    let out: string;

    try {
        out = execSync(cmd).toString();
    } catch (error) {
        out = String(error);
    }

    // TODO - review all pkg managers to ensure behavior is consistent
    // (if someone returned 'pkg A not found' this code wouldn't work, that's what i mean)
    // TESTED: wget, brew, brew-k
    if (out.includes(kps.val)) return true;
    return false;
}
