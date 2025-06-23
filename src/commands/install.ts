import { KPI } from "../api/core";
import { FILENAMES, PKG_PATH, USR_PATH } from "../constants";
import { existsSync, readFileSync, mkdirSync, statSync, chmodSync } from "fs";
import { konsole } from "../toolkit/konsole";
import { join } from "path";
import { parse } from "yaml";
import { getCurrentPlatformKps, getCurrentPlatformShaKey, parseKps } from "../api/manifest";
import type { KONBINI_PKG_LOCKFILE } from "../types/lockfile";
import { downloadHandler } from "../toolkit/install";
import type { KONBINI_HASH_FILE } from "../types/hashfile";
import { KbiSecSHA } from "../security/sha";
import { KbiSecGPG } from "../security/gpg";
import { destroyPkg } from "../toolkit/remove";
import { installAliasedPackage } from "../toolkit/aliased";
import { writeLaunchpadShortcut, writeLockfile } from "../toolkit/write";

async function installSingleExecutable(params: {
    filePath: string;
    remote: { asset: string; version: string };
}): Promise<Omit<Omit<Extract<KONBINI_PKG_LOCKFILE, { scope: "std" }>, "current_sha">, "pkg">> {
    const { filePath, remote } = params;
    konsole.adv(`Downloading executable from KBI remote`);
    konsole.war(
        "We're still thinking about how to show a progressbar for this, until then just wait.\n      The process is NOT frozen. Downloads are timed out, so we won't hang for hours.",
    );

    // download the package
    await downloadHandler({
        remoteUrl: remote.asset,
        filePath,
    });

    return {
        ver: remote.version,
        remote: remote.asset,
        timestamp: new Date().toString(),
        scope: "std",
    };
}

/** Downloads all safety related files. Returns the SHA hash for the downloaded file. */
async function downloadSafetyRelatedFiles(params: {
    ascRemote: string;
    ascPath: string;
    shaRemote: string;
    shaPath: string;
    shaPlatform: keyof KONBINI_HASH_FILE;
}): Promise<{ shaHash: string }> {
    const { ascPath, ascRemote, shaPath, shaRemote, shaPlatform } = params;

    konsole.dbg(`Downloading GNU Privacy Guard signature first...`);
    try {
        await downloadHandler({
            remoteUrl: ascRemote,
            filePath: ascPath,
        });
        konsole.dbg(
            "Success! We got the signature. We'll use it to ensure the package is valid before making it usable.",
        );
    } catch {
        konsole.err(
            "CRITICAL: Unable to download GPG signature file. Cannot validate signature of the package, meaning it's unsafe. For your own safety, we did not download it.",
        );
        process.exit(1);
    }

    konsole.dbg(`Downloading Secure Hash Algorithm 3-512 bits hashfile next...`);
    try {
        await downloadHandler({
            remoteUrl: shaRemote,
            filePath: shaPath,
        });
        konsole.dbg(
            "Success! We got the hash. We'll use it to ensure the package is not corrupt before making it usable.",
        );
    } catch {
        konsole.err(
            "CRITICAL: Unable to download the Konbini hashfile. Cannot validate integrity of the package, meaning it's unsafe. For your own safety, we did not download it.",
        );
        process.exit(1);
    }

    const hashfile = parse(readFileSync(shaPath, { encoding: "utf-8" })) as KONBINI_HASH_FILE;

    const shaHash = hashfile[shaPlatform];

    if (!shaHash) {
        konsole.err(
            "Something (we don't know what) went wrong finding the SHA3-512 hash for this download.",
        );
        konsole.dbg(
            `Perhaps you should check the ${shaPath} file to see if it's wrong. It should contain several hashes, seek your platforms one (PLATFORM: ${shaPlatform}).`,
        );
        process.exit(1);
    }

    return { shaHash };
}

export async function installPackage(pkgName: string, method: "install" | "update" = "install") {
    const manifest = await KPI.manifest(pkgName);

    const usrDir = USR_PATH({ author: manifest.author_id });
    const pkgDir = PKG_PATH({ pkg: pkgName, author: manifest.author_id });

    let reinstall: boolean = false;

    if (existsSync(pkgDir)) {
        if (method === "install") {
            const conf = konsole.ask(`${pkgName} is already installed. Reinstall?`);
            if (!conf) {
                konsole.suc("Got it. No actions taken.");
                return;
            } else {
                konsole.suc("At your order, captain. Reinstalling this package.");
                reinstall = true;
            }
        } else {
            konsole.adv("Updating package", pkgName);
        }
    }

    const platform = getCurrentPlatformKps(manifest.platforms);
    if (!platform) {
        konsole.err(`${manifest.name} is not supported on your platform. Sorry.`);
        process.exit(1);
    }
    const kps = parseKps(platform);
    if (kps.src !== "std") {
        const ret = installAliasedPackage({
            kps,
            pkgName,
            manifest,
            method,
            reinstall,
        });
        if (ret === "installedOrUpdated")
            konsole.suc(
                `Thanks for using Konbini, ${manifest.name} was successfully installed. Enjoy!`,
            );
        return;
    }

    konsole.dbg(`Reading remotes for ${manifest.name}`);
    const remotes = await KPI.pkgRemotes(platform, manifest);

    const prevManifest = parse(
        readFileSync(join(pkgDir, FILENAMES.lockfile), { encoding: "utf-8" }),
    ) as KONBINI_PKG_LOCKFILE;

    if (prevManifest.scope === "std" && prevManifest.ver === remotes.pkgVersion) {
        konsole.suc(`${pkgName} is already up to date.`);
        return;
    }

    /** package pathname */
    const outputPath = join(pkgDir, pkgName);
    /** hashfile pathname */
    const shaPath = join(pkgDir, FILENAMES.hashfile);
    /** signature pathname */
    const ascPath = outputPath + ".asc";

    if (!existsSync(pkgDir)) {
        const usrDir = USR_PATH({ author: manifest.author_id });
        if (!existsSync(usrDir)) mkdirSync(usrDir);
        mkdirSync(pkgDir);
    }

    konsole.adv(`Installing ${pkgName}`);
    konsole.dbg(`Will write to ${outputPath}`);

    const safetyInfo = await downloadSafetyRelatedFiles({
        shaPath,
        ascPath,
        shaRemote: remotes.shaAsset,
        ascRemote: remotes.ascAsset,
        shaPlatform: getCurrentPlatformShaKey(),
    });

    const authorAscPath = await KPI.authorSignature(manifest.author_id, usrDir);

    const stuff = await installSingleExecutable({
        filePath: outputPath,
        remote: {
            version: remotes.pkgVersion,
            asset: remotes.coreAsset,
        },
    });

    if (!KbiSecSHA.assertIntegrity(outputPath, safetyInfo.shaHash)) {
        konsole.err(
            "SHA hashes DO NOT MATCH!! The download corrupted. Try re-downloading, as sometimes corruption happens randomly. If it happens again, please report this to Hana, or the package author.",
        );
        konsole.war(`Expected hash: ${KbiSecSHA.hash(outputPath)}`);
        konsole.war(`Received hash: ${safetyInfo.shaHash}`);
        destroyPkg(pkgDir);
        process.exit(1);
    }
    konsole.dbg("SHA hash matches, download is valid. Nice.");
    const gpgMatch = await KbiSecGPG.assertIntegrity({
        executableFilePath: outputPath,
        executableAscFilePath: ascPath,
        authorAscFilePath: authorAscPath,
    });
    if (gpgMatch !== "valid") {
        konsole.err(
            "GPG signature IS NOT VALID!! The download is invalid. Please report this to Hana, as this download might be malicious. It could also be a mistake by the author, though.",
        );
        konsole.dbg(
            gpgMatch === "error"
                ? "Note: Its an unknown error that triggered this."
                : gpgMatch === "non-valid"
                  ? "Note: Its an invalid signature (does NOT match at all) that triggered this."
                  : "Note: Its a non-compliant (does OR does NOT match, but DOES NOT comply with the required GPG-SHA512 standard) that triggered this.",
        );
        destroyPkg(pkgDir);
        process.exit(1);
    }
    konsole.dbg("GPG signature matches, download is authentic. Nice.");
    konsole.dbg("Security tests passed - great! We'll make this install usable right now.");

    const lockfile = { ...stuff, pkg: pkgName, current_sha: safetyInfo.shaHash };
    writeLockfile(lockfile, pkgName, manifest.author_id);
    konsole.dbg("Lockfile written.");

    // generate launchpad shortcut
    writeLaunchpadShortcut(pkgName, manifest.author_id, outputPath);
    konsole.dbg("Launchpad shortcut written.");

    chmodSync(outputPath, statSync(outputPath).mode | 0o111);
    konsole.dbg("Made the executable actually runnable.");

    konsole.suc(`Thanks for using Konbini, ${manifest.name} was successfully installed. Enjoy!`);
    return;
}
