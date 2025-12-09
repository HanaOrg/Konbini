import { version } from "../package.json";
import {
    PACKAGES_DIR,
    LAUNCHPAD_DIR,
    INSTALLATION_DIR,
    SIGNATURE_DIR,
    CFG_DIR,
} from "shared/client";
import { konsole } from "shared/client";
import { installPackage } from "./commands/install";
import { existsSync, mkdirSync, realpathSync } from "fs";
import { listPackages } from "./commands/list";
import { removePackage } from "./toolkit/remove";
import { learn } from "./commands/learn";
import { showPkgInfo, showUserInfo } from "./commands/info";
import { updatePackages } from "./commands/update";
import { generatePkgManifest } from "./commands/manifest-pkg";
import { generateUsrManifest } from "./commands/manifest-usr";
import { about } from "./commands/about";
import { validateAgainst } from "strings-utils";
import { sign } from "./commands/sign";
import { getPlatform } from "shared/api/platform";
import { konbiniHash } from "shared/security";
import { konpakFromDir } from "./commands/konpak";
import { parseArgs } from "util";
import { Unpack } from "../../konpak/src/unpack";
import { parseID } from "shared/api/core";
import { ensureSecurity } from "./commands/secure";
import { selfUpdate } from "./commands/self-update";
import { getTpmList, trustPackageManager, untrustPackageManager } from "./toolkit/tpm";
import { isKpsSource } from "shared/types/manifest";
import { find } from "./commands/find";

const p = getPlatform();
const platformString =
    p === "win64"
        ? konsole.clr("#00A4EF", "Microsoft Windows")
        : ["linux64", "linuxArm"].includes(p)
          ? konsole.clr("#FFCC00", "Linux")
          : konsole.clr("#A2AAAD", "macintosh OS");

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const subcommand = args[1];

    if (!command) {
        console.log(
            [
                `${konsole.clr("deeppink", "Konbini")} CLI for ${platformString} v${version}`,
                "Enter a command to get started. Available commands:",
                konsole.clr("lightgrey", "<parameters> are mandatory, [-flags] are optional."),
                `> install <pkg>          ${konsole.clr("grey", "// installs a package")}`,
                `> update [pkg]           ${konsole.clr("grey", "// updates a package, or all packages if none specified")}`,
                `> remove <pkg>           ${konsole.clr("grey", "// removes a package")}`,
                `> unpack <path>          ${konsole.clr("grey", "// manually installs a Konpak")}`,
                `> info <pkg | user>      ${konsole.clr("grey", "// shows info for a specific package or publisher")}`,
                `> list [-v]              ${konsole.clr("grey", "// lists all installed packages")}`,
                `> find                   ${konsole.clr("grey", "// (ONLY FLATPAK) finds programs you already installed for Konbini to recognize them")}`,
                `> tpm [option] [mgr]     ${konsole.clr("grey", "// shows trusted managers and lets you modify trusts")}`,
                `> learn <item>           ${konsole.clr("grey", "// shows helpful info about something specific")}`,
                `> where                  ${konsole.clr("grey", "// shows where all program files are stored")}`,
                `> about                  ${konsole.clr("grey", "// shows some info about Konbini")}`,
                `> -v, --version          ${konsole.clr("grey", "// shows current Konbini version")}`,
                "",
                `- for developers         ${konsole.clr("grey", "// commands for package maintainers")}`,
                "",
                `> hash <file>            ${konsole.clr("grey", "// generates a Konbini compliant hash for the given file")}`,
                `> sign <mode> [...]      ${konsole.clr("grey", "// works around PGP signatures, run it for more info")}`,
                `> manifest <type>        ${konsole.clr("grey", "// helps you creating a manifest for a package / publisher profile")}`,
                `> konpak <dir>           ${konsole.clr("grey", "// turns the specified directory into a Konpak")}`,
            ].join("\n"),
        );
        return;
    }

    // checks for DIRs only if a command is run, so help shows a few ms faster
    if (!existsSync(PACKAGES_DIR)) mkdirSync(PACKAGES_DIR, { recursive: true });
    if (!existsSync(LAUNCHPAD_DIR)) mkdirSync(LAUNCHPAD_DIR, { recursive: true });
    if (!existsSync(CFG_DIR)) mkdirSync(CFG_DIR, { recursive: true });

    switch (command) {
        case "install":
            if (!subcommand) throw "No package specified.";
            if (validateAgainst(subcommand, ["konbini", "kbi"])) {
                await selfUpdate();
                break;
            }
            await installPackage(subcommand);
            break;
        case "list":
            const len = listPackages(
                validateAgainst(subcommand, ["-v", "--verbose"]) ? "VERBOSE" : "STANDARD",
            );
            if (len.length > 0)
                konsole.adv(
                    "Totalling",
                    len.length.toString(),
                    "packages installed.",
                    len.length >= 69 ? "Isn't that a lot?" : "Nice!",
                );
            break;
        case "update":
            if (validateAgainst(subcommand, ["konbini", "kbi"])) {
                await selfUpdate();
                break;
            }
            await updatePackages();
            break;
        case "remove":
        case "delete":
        case "goodbye":
            if (!subcommand) throw "No package specified.";
            await removePackage(subcommand);
            break;
        case "where":
            konsole.suc("Here's where we live on your PC:");
            konsole.adv("Konbini is installed at and running from", import.meta.dir);
            konsole.adv("Konbini executables overall live at", INSTALLATION_DIR);
            konsole.adv("Installed packages (non scoped) are at", PACKAGES_DIR);
            konsole.adv("Launchpad shortcuts are at", LAUNCHPAD_DIR);
            konsole.adv("Your private signatures (NEVER SHARE THEM) are stored at", SIGNATURE_DIR);
            break;
        case "info":
            if (!subcommand) throw "No package or user specified.";
            if (parseID(subcommand).package !== null) await showPkgInfo(subcommand);
            else await showUserInfo(subcommand);
            break;
        case "hash":
            if (!subcommand) throw "No file specified.";
            if (args.includes("--porcelain")) {
                console.log(konbiniHash(subcommand));
                return;
            }
            konsole.adv("Konbini HASH for file", realpathSync(subcommand));
            konsole.dbg(
                'Run "learn hash" if you\'re curious about why we use our own hasher for Konbini.',
            );
            konsole.suc(konbiniHash(subcommand));
            break;
        case "ensure-security":
            await ensureSecurity();
            break;
        case "sign":
            if (!validateAgainst(subcommand, ["new", "apply", "list"]))
                throw `No action specified. Available options are 'new', 'apply' or 'list'.\nTo learn further, run 'learn sign'`;
            await sign(subcommand);
            break;
        case "manifest":
            if (subcommand === "usr") await generateUsrManifest();
            else if (subcommand === "pkg") await generatePkgManifest();
            else konsole.err("Invalid manifest type, either 'usr' or 'pkg'.");
            break;
        case "find":
            await find();
            break;
        case "konpak":
            if (!subcommand)
                throw "No directory specified. Specify one.\nTo learn more, run 'learn konpak'.";
            try {
                const { platform, id, binary, ver, icon, sfx } = parseArgs({
                    args: args.slice(2),
                    options: {
                        platform: { type: "string" },
                        id: { type: "string" },
                        binary: { type: "string" },
                        ver: { type: "string" },
                        icon: { type: "string" },
                        sfx: { type: "boolean" },
                    },
                }).values;
                await konpakFromDir(subcommand, platform, id, binary, ver, icon, sfx);
            } catch (e) {
                konsole.err(Error.isError(e) ? e.message + "." : e);
            }
            break;
        case "tpm":
            if (!subcommand) {
                konsole.adv(
                    `Package manager trust list\n${Object.entries(getTpmList())
                        .map(
                            ([mgr, trusted]) =>
                                `${mgr}: ${
                                    mgr === "kbi"
                                        ? konsole.clr("magenta", "ALWAYS TRUSTED")
                                        : trusted
                                          ? konsole.clr("lightgreen", "TRUSTED")
                                          : konsole.clr("red", "UNTRUSTED")
                                }`,
                        )
                        .join("\n")}\nTrust or untrust via 'tpm [trust OR untrust] [mgr]'.`,
                );
                break;
            }
            if (!validateAgainst(subcommand, ["trust", "untrust"]))
                throw `Subcommand must be 'trust' or 'untrust'.`;
            if (subcommand === "trust") {
                if (!isKpsSource(args[2])) throw `Invalid package manager.`;
                trustPackageManager(args[2]);
                konsole.suc("Trusted.");
                break;
            } else {
                if (!isKpsSource(args[2])) throw `Invalid package manager.`;
                untrustPackageManager(args[2]);
                konsole.suc("Untrusted.");
                break;
            }
        case "unpack":
            if (!subcommand) throw "No filepath specified!";
            Unpack(subcommand);
            break;
        case "learn":
            learn(subcommand);
            break;
        case "about":
            about();
            break;
        case "-v":
        case "--version":
        case "version":
        case "v":
            konsole.adv("Konbini CLI", version, "for", platformString);
            konsole.adv(
                "Written in BunJS, version",
                Bun.version,
                "(running version",
                process.versions.node,
                "of NodeJS)",
            );
            break;
        default:
            konsole.err(
                `Unknown command '${command}'. Run Konbini with no arguments to see all available commands.`,
            );
            process.exit(1);
    }
}

try {
    await main();
} catch (e) {
    konsole.err(e as string);
    process.exit(1);
}
