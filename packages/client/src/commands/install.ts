import { PKG_PATH, USR_PATH } from "shared/client";
import { existsSync, readFileSync, mkdirSync, statSync, chmodSync } from "fs";
import { konsole } from "shared/client";
import { join } from "path";
import { destroyPkg } from "../toolkit/remove";
import { installAliasedPackage, packageExists } from "../toolkit/aliased";
import { writeLaunchpadShortcut, writeLockfile } from "../toolkit/write";
import { isKbiScope, isKps, type KONBINI_MANIFEST } from "shared/types/manifest";
import { isKbiLockfile, type KONBINI_HASHFILE, type KONBINI_LOCKFILE } from "shared/types/files";
import { getPkgManifest } from "shared/api/core";
import { downloadHandler } from "shared/api/download";
import { getPkgRemotes, getUsrSignature } from "shared/api/getters";
import { parseKps } from "shared/api/manifest";
import { getPlatform } from "shared/api/platform";
import { FILENAMES } from "shared/constants";
import { assertIntegritySHA, assertIntegrityPGP } from "shared/security";
import { Unpack } from "../../../konpak/src/unpack";
import { logAction, scanPackage } from "shared/api/kdata";
import { isPkgId } from "shared/types/author";
import { listPackages } from "./list";

async function assertSafety(
    pkgDir: string,
    outputPath: string,
    expectedFileHash: string,
    expectedKGuardHash: string,
    usrSignaturePath: string,
    pkgSignaturePath: string,
) {
    if (
        !assertIntegritySHA(outputPath, expectedFileHash) ||
        !assertIntegritySHA(outputPath, expectedKGuardHash)
    ) {
        konsole.err(
            "SHA hashes DO NOT MATCH!! The download corrupted. Try re-downloading, as sometimes corruption happens randomly. If it happens again, please report this to Hana, or the package author.",
        );
        destroyPkg(pkgDir);
        process.exit(1);
    }
    konsole.dbg("SHA hash matches, download is valid. Nice.");
    // TODO(@ZakaHaceCosas): store signature on KGuard too
    // not a priority or something we need to do before release
    // it doesn't really affect security after all, improvement is really tiny
    // but it kinda exists, and our schema says this should check for a stored signature
    // so yeah
    const pgpMatch = await assertIntegrityPGP({
        executableFilePath: outputPath,
        executableAscFilePath: pkgSignaturePath,
        authorAscFilePath: usrSignaturePath,
    });
    if (pgpMatch !== "valid") {
        konsole.err(
            "PGP signature IS NOT VALID!! The download is invalid. Please report this to Hana, as this download might be malicious. It could also be a mistake by the author, though.",
        );
        konsole.dbg(
            pgpMatch === "error"
                ? "Note: It's an unknown error that triggered this."
                : "Note: It's an invalid signature (does NOT match at all) that triggered this.",
        );
        destroyPkg(pkgDir);
        process.exit(1);
    }
    konsole.dbg("PGP signature matches, download is authentic. Nice.");
    konsole.dbg("Security tests passed - great! We'll make this install usable right now.");
}

async function installSingleExecutable(params: {
    filePath: string;
    remote: { asset: string; version: string };
}) {
    const { filePath, remote } = params;
    konsole.adv(`Downloading executable from KBI remote`);
    konsole.war(
        "We're still thinking about how to show a progressbar for this, until then just wait.\nThe process is NOT frozen. Downloads are timed out, so we won't hang for hours.",
    );

    // download the package
    const out = await downloadHandler({
        remoteUrl: remote.asset,
        filePath,
    });

    if (out === "TimeOut") {
        konsole.war("Download took too long to complete (timeout'd after 4 minutes).");
        // easter egg
        if (Math.random() < 0.2) konsole.war("hope no one's DDoS-ing us");
        process.exit(1);
    }

    return {
        version: remote.version,
        remote_url: remote.asset,
        timestamp: new Date().toString(),
    };
}

/** Downloads all safety related files. Returns the SHA hash for the downloaded file. */
async function downloadSafetyRelatedFiles(params: {
    ascRemote: string;
    ascPath: string;
    shaRemote: string;
    shaPath: string;
}): Promise<{ shaHash: string }> {
    const { ascPath, ascRemote, shaPath, shaRemote } = params;

    konsole.dbg("Downloading GNU Privacy Guard signature first...");
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

    const hashfile = Bun.YAML.parse(
        readFileSync(shaPath, { encoding: "utf-8" }),
    ) as KONBINI_HASHFILE;

    const platform = getPlatform();
    const shaHash = hashfile[platform];

    if (!shaHash) {
        konsole.err(
            "Something (we don't know what) went wrong finding the SHA3-512 hash for this download.",
        );
        konsole.dbg(
            `Perhaps you should check the ${shaPath} file to see if it's wrong. It should contain several hashes, seek your platforms one (PLATFORM: ${platform}).`,
        );
        process.exit(1);
    }

    return { shaHash };
}

export async function installPackage(
    pkgId: string,
    method: "install" | "update" | "reinstall" = "install",
) {
    if (pkgId.includes(":")) {
        if (!isKps(pkgId)) throw `Cannot grab "${pkgId}", it's an invalid package scope.`;
        const kps = parseKps(pkgId);
        if (kps.src === "kbi")
            throw `Cannot grab "${kps.value}" - a Konbini scope always points to a package that IS in Konbini's repository.`;
        const conf = konsole.ask(`Are you sure you want to grab ${kps.value} from ${kps.name}?`);
        if (!conf) return;
        konsole.war(
            "Be advised that grabbed packages aren't properly configured and may not correctly install.",
        );
        konsole.war("Proceeding...");
        const id = `kbi.grabbed.${kps.value}` as const;
        const ret = await installAliasedPackage({
            pkgId: id,
            manifest: {
                name: kps.value,
                // idk man this needs a value in order not to fail
                author: id,
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
    if (!isPkgId(pkgId)) throw `Invalid package ID ${pkgId}.`;

    const platformName = getPlatform();
    const manifest = await getPkgManifest(pkgId);
    const platform = manifest.platforms[platformName];
    if (!platform) {
        konsole.err(`${manifest.name} is not supported on your platform. Sorry.`);
        process.exit(1);
    }
    // if not Kbi, ver and hash and all of that won't even be used
    // but we need it to prevent typeerror & to avoid scanning the package
    // (non-Kbi = not hosted by us = not scanned = scanPackage throws = thing breaks = user sad)
    const kGuardResponse = isKbiScope(platform)
        ? await scanPackage(`${pkgId}@${platformName}`)
        : { isSafe: true, results: { ver: "no-op", hash: "no-op" } };

    if (!kGuardResponse.isSafe)
        throw `This package has been recently reported as insecure. While we investigate the issue, ${pkgId} cannot be installed. Sorry.`;

    const usrDir = USR_PATH({ author: manifest.author });
    const pkgDir = PKG_PATH({ pkg: pkgId, author: manifest.author });

    if (packageExists(platform, manifest.author)) {
        if (!listPackages("SILENT").some((i) => i.pkg_id === manifest.id)) {
            writeLockfile(
                {
                    pkg_id: manifest.id,
                    scope: platform,
                    timestamp: new Date().toString(),
                    version: "unknown",
                    remote_url: "unknown",
                    installation_hash: "unknown",
                },
                manifest.id,
                manifest.author,
            );
            konsole.dbg(
                "Somehow, this was installed but we didn't have a lockfile.\nOne was generated right now (values are 'unknown', heads up).",
            );
            konsole.dbg(
                "Reinstalling may better populate said lockfile (not really needed though).",
            );
        }
        if (method === "install") {
            const conf = konsole.ask(`${pkgId} is already installed. Reinstall?`);
            if (!conf) {
                konsole.suc("Got it. No actions taken.");
                return;
            } else {
                konsole.suc("At your order, captain. Reinstalling this package.");
                // mutate this so it works when doing aliased install
                method = "reinstall";
            }
        } else {
            konsole.adv("Updating package", pkgId);
        }
    }

    const kps = parseKps(platform);
    if (!isKbiScope(platform)) {
        const ret = await installAliasedPackage({
            kps,
            pkgId,
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
    const remotes = await getPkgRemotes(platform, manifest, kGuardResponse.results.ver);

    const prevLockfilePath = join(pkgDir, FILENAMES.lockfile);

    if (existsSync(prevLockfilePath)) {
        const prevLockfile = Bun.YAML.parse(
            readFileSync(prevLockfilePath, { encoding: "utf-8" }),
        ) as KONBINI_LOCKFILE;

        if (isKbiLockfile(prevLockfile) && prevLockfile.version === remotes.pkgVersion) {
            if (method === "update") {
                konsole.suc(`${pkgId} is already up to date.`);
                return;
            }
            if (method === "install") {
                const conf = konsole.ask(`${pkgId} is already installed. Reinstall?`);
                if (!conf) {
                    konsole.suc("Got it. No actions taken.");
                    return;
                } else {
                    konsole.suc("At your order, captain. Reinstalling this package.");
                    // mutate this so it works when doing aliased install
                    method = "reinstall";
                }
            }
        }
    }

    /** package pathname */
    const outputPath = join(pkgDir, kps.value);
    /** hashfile pathname */
    const shaPath = join(pkgDir, FILENAMES.hashfile);
    /** signature pathname */
    const ascPath = outputPath + ".asc";

    if (!existsSync(pkgDir)) {
        const usrDir = USR_PATH({ author: manifest.author });
        if (!existsSync(usrDir)) mkdirSync(usrDir);
        mkdirSync(pkgDir);
    }

    konsole.adv(`Installing ${pkgId}`);
    konsole.dbg(`Will write to ${outputPath}`);

    const safetyInfo = await downloadSafetyRelatedFiles({
        shaPath,
        ascPath,
        shaRemote: remotes.shaAsset,
        ascRemote: remotes.ascAsset,
    });

    const authorAscPath = await getUsrSignature(manifest.author, usrDir);

    const stuff = await installSingleExecutable({
        filePath: outputPath,
        remote: {
            version: remotes.pkgVersion,
            asset: remotes.coreAsset,
        },
    });

    await assertSafety(
        pkgDir,
        outputPath,
        safetyInfo.shaHash,
        kGuardResponse.results.hash,
        authorAscPath,
        ascPath,
    );

    const lockfile: KONBINI_LOCKFILE = {
        ...stuff,
        scope: platform,
        pkg_id: pkgId,
        installation_hash: safetyInfo.shaHash,
    };
    writeLockfile(lockfile, pkgId, manifest.author);
    konsole.dbg("Lockfile written.");

    if (readFileSync(outputPath).subarray(0, 14).toString() == "KPAK__SIGNALER") {
        konsole.dbg("This is a Konpak. Unpacking...");
        Unpack(outputPath);
        konsole.dbg("Konpak unpacked.");
    }

    // generate launchpad shortcut
    // the function itself makes the "shortcut written log"
    writeLaunchpadShortcut(pkgId, manifest.author, outputPath, null);

    chmodSync(outputPath, statSync(outputPath).mode | 0o111);
    konsole.dbg("Made the executable actually runnable.");

    // if its a new installation, log it
    if (method === "install") {
        const res = await logAction({
            app: pkgId,
            version: remotes.pkgVersion,
            action: "download",
        });
        if (res.status == 429)
            konsole.dbg(
                "Uhh... You're using Konbini a bit too much. Your actions won't count towards download counts for a while (HTTP 429).",
            );
        else konsole.dbg("Telemetry data written.");
    }
    konsole.suc(`Thanks for using Konbini, ${manifest.name} was successfully installed. Enjoy!`);
    return;
}
