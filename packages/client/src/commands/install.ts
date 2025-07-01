import { PKG_PATH, USR_PATH } from "shared/client";
import { existsSync, readFileSync, mkdirSync, statSync, chmodSync } from "fs";
import { konsole } from "shared/client";
import { join } from "path";
import { parse } from "yaml";
import { destroyPkg } from "../toolkit/remove";
import { installAliasedPackage, packageExists } from "../toolkit/aliased";
import { writeLaunchpadShortcut, writeLockfile } from "../toolkit/write";
import {
    type KONBINI_LOCKFILE,
    downloadHandler,
    type KONBINI_HASHFILE,
    getPkgManifest,
    getCurrentPlatformKps,
    parseKps,
    getPkgRemotes,
    FILENAMES,
    getCurrentPlatformShaKey,
    assertIntegritySHA,
    konbiniHash,
    assertIntegrityPGP,
    getUsrSignature,
    isStdLockfile,
} from "shared";
import { isKps, isStdScope, type KONBINI_MANIFEST } from "shared/types/manifest";

async function installSingleExecutable(params: {
    filePath: string;
    remote: { asset: string; version: string };
}) {
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

    // TODO - place this somewhere
    // konsole.war("Download took too long to complete (timeout: 4 minutes).");
    // easter egg
    // if (Math.random() < 0.3) konsole.war("hope no one's DDoS-ing us");
    // process.exit(1);

    return {
        version: remote.version,
        remote_url: remote.asset,
        installation_ts: new Date().toString(),
    };
}

/** Downloads all safety related files. Returns the SHA hash for the downloaded file. */
async function downloadSafetyRelatedFiles(params: {
    ascRemote: string;
    ascPath: string;
    shaRemote: string;
    shaPath: string;
    shaPlatform: keyof KONBINI_HASHFILE;
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
            "CRITICAL: Unable to download PGP signature file. Cannot validate signature of the package, meaning it's unsafe. For your own safety, we did not download it.",
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

    const hashfile = parse(readFileSync(shaPath, { encoding: "utf-8" })) as KONBINI_HASHFILE;

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

export async function installPackage(
    pkgName: string,
    method: "install" | "update" | "reinstall" = "install",
) {
    if (pkgName.startsWith("grab:")) {
        const possiblyKps = pkgName.split("grab:")[1];
        if (!isKps(possiblyKps))
            throw `Cannot grab "${possiblyKps}", it's an invalid package scope.`;
        const kps = parseKps(possiblyKps);
        if (kps.src === "std")
            throw `Cannot grab ${kps.value} - a Konbini scope will either point to a package already in the repo or a package that doesn't exist in any repo!`;
        const conf = konsole.ask(`Are you sure you want to grab ${kps.value} from ${kps.name}?`);
        if (!conf) return;
        konsole.war(
            "Be advised that grabbed packages aren't properly configured and may not correctly install.",
        );
        konsole.war("Proceeding...");
        const ret = installAliasedPackage({
            pkgName: kps.value,
            manifest: {
                name: kps.value,
                author_id: "kbi.grabbed",
            } as any as KONBINI_MANIFEST,
            kps,
            method,
        });
        if (ret === "needsPkgMgr")
            throw `Cannot grab from ${kps.name} without it being installed locally.`;
        if (ret === "upToDate") throw `Grabbed package ${kps.value} already up to date.`;
        if (ret === "installedOrUpdated") konsole.suc(`Grabbed ${kps.value} successfully!`);
        return;
    }

    const manifest = await getPkgManifest(pkgName);

    const usrDir = USR_PATH({ author: manifest.author_id });
    const pkgDir = PKG_PATH({ pkg: pkgName, author: manifest.author_id });

    if (await packageExists(pkgName)) {
        if (method === "install") {
            const conf = konsole.ask(`${pkgName} is already installed. Reinstall?`);
            if (!conf) {
                konsole.suc("Got it. No actions taken.");
                return;
            } else {
                konsole.suc("At your order, captain. Reinstalling this package.");
                // mutate this so it works when doing aliased install
                method = "reinstall";
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
    if (!isStdScope(platform)) {
        const ret = installAliasedPackage({
            kps,
            pkgName,
            manifest,
            method,
        });
        if (ret === "upToDate") konsole.suc(`${manifest.name} is already up to date.`);
        else if (ret === "installedOrUpdated")
            konsole.suc(
                `Thanks for using Konbini, ${manifest.name} was successfully installed. Enjoy!`,
            );
        return;
    }

    konsole.dbg(`Reading remotes for ${manifest.name}`);
    const remotes = await getPkgRemotes(platform, manifest);

    const prevLockfilePath = join(pkgDir, FILENAMES.lockfile);

    if (existsSync(prevLockfilePath)) {
        const prevLockfile = parse(
            readFileSync(prevLockfilePath, { encoding: "utf-8" }),
        ) as KONBINI_LOCKFILE;

        if (isStdLockfile(prevLockfile) && prevLockfile.version === remotes.pkgVersion) {
            konsole.suc(`${pkgName} is already up to date.`);
            return;
        }
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

    const authorAscPath = await getUsrSignature(manifest.author_id, usrDir);

    const stuff = await installSingleExecutable({
        filePath: outputPath,
        remote: {
            version: remotes.pkgVersion,
            asset: remotes.coreAsset,
        },
    });

    if (!assertIntegritySHA(outputPath, safetyInfo.shaHash)) {
        konsole.err(
            "SHA hashes DO NOT MATCH!! The download corrupted. Try re-downloading, as sometimes corruption happens randomly. If it happens again, please report this to Hana, or the package author.",
        );
        konsole.war(`Expected hash: ${konbiniHash(outputPath)}`);
        konsole.war(`Received hash: ${safetyInfo.shaHash}`);
        destroyPkg(pkgDir);
        process.exit(1);
    }
    konsole.dbg("SHA hash matches, download is valid. Nice.");
    const pgpMatch = await assertIntegrityPGP({
        executableFilePath: outputPath,
        executableAscFilePath: ascPath,
        authorAscFilePath: authorAscPath,
    });
    if (pgpMatch !== "valid") {
        konsole.err(
            "PGP signature IS NOT VALID!! The download is invalid. Please report this to Hana, as this download might be malicious. It could also be a mistake by the author, though.",
        );
        konsole.dbg(
            pgpMatch === "error"
                ? "Note: Its an unknown error that triggered this."
                : "Note: Its an invalid signature (does NOT match at all) that triggered this.",
        );
        destroyPkg(pkgDir);
        process.exit(1);
    }
    konsole.dbg("PGP signature matches, download is authentic. Nice.");
    konsole.dbg("Security tests passed - great! We'll make this install usable right now.");

    const lockfile: KONBINI_LOCKFILE = {
        ...stuff,
        scope: platform,
        pkg: pkgName,
        installation_hash: safetyInfo.shaHash,
    };
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
