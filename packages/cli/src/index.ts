import { version } from "../package.json";
import { INSTALL_DIR, LAUNCHPAD_DIR } from "./constants";
import { konsole } from "./toolkit/konsole";
import { installPackage } from "./commands/install";
import { existsSync, mkdirSync, realpathSync } from "fs";
import { listPackages } from "./commands/list";
import { removePackage } from "./toolkit/remove";
import { learn } from "./commands/learn";
import { showPkgInfo, showUserInfo } from "./commands/info";
import { addToUserPathEnvVariable } from "./toolkit/path";
import { updatePackages } from "./commands/update";
import { generateManifest } from "./commands/manifest-pkg";
import { about } from "./commands/about";
import { getPlatform } from "shared";
import { konbiniHash } from "shared";

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

    if (!existsSync(INSTALL_DIR)) mkdirSync(INSTALL_DIR, { recursive: true });
    if (!existsSync(LAUNCHPAD_DIR)) mkdirSync(LAUNCHPAD_DIR, { recursive: true });
    addToUserPathEnvVariable(LAUNCHPAD_DIR);

    if (!command) {
        console.log(
            [
                `${konsole.clr("deeppink", "Konbini")} CLI for ${platformString} v${version}`,
                "Enter a command to get started. Available commands:",
                konsole.clr("lightgrey", "<parameters> are mandatory, [-flags] are optional."),
                `> install <pkg>      ${konsole.clr("grey", "// installs a package")}`,
                `> update [pkg]       ${konsole.clr("grey", "// updates a package, or all packages if none specified")}`,
                `> remove <pkg>       ${konsole.clr("grey", "// removes a package")}`,
                `> info <pkg | user>  ${konsole.clr("grey", "// shows info for a specific package or publisher")}`,
                `> list [-v]          ${konsole.clr("grey", "// lists all installed packages")}`,
                `> learn <item>       ${konsole.clr("grey", "// shows helpful info about something specific")}`,
                `> where              ${konsole.clr("grey", "// shows where all program files are stored")}`,
                `> about              ${konsole.clr("grey", "// shows some info about Konbini")}`,
                `> -v, --version      ${konsole.clr("grey", "// shows current Konbini version")}`,
                "",
                `- "kbd" prefixed commands are for developers. ${konsole.clr("grey", "// KonBini Dev, KBD, get it?")}`,
                "",
                `> kbd-hash <file>    ${konsole.clr("grey", "// generates a Konbini compliant SHA hash for the given file")}`,
                `> kbd-manifest-pkg   ${konsole.clr("grey", "// guides you and creates a manifest for a Konbini package")}`,
            ].join("\n"),
        );
        return;
    }

    switch (command) {
        case "install":
            if (!subcommand) throw "No package specified.";
            await installPackage(subcommand);
            break;
        case "list":
            const len = await listPackages(subcommand === "-v" ? "VERBOSE" : "STANDARD");
            if (len.length > 0)
                konsole.adv(
                    "Totalling",
                    len.length,
                    "packages installed.",
                    len.length >= 169 ? "Isn't that a lot?" : "Nice!",
                );
            break;
        case "update":
            await updatePackages();
            break;
        case "remove":
        case "delete":
        case "goodbye":
            if (!subcommand) throw "No package specified.";
            await removePackage(subcommand);
            break;
        case "where":
            konsole.suc("Sure, here's where we live on your PC:");
            konsole.adv("Konbini is installed at and running from", import.meta.dir);
            konsole.adv(
                "Installed packages (that don't come from a scoped 3rd party pkg manager) are at",
                INSTALL_DIR,
            );
            konsole.adv("Launchpad shortcuts are at", LAUNCHPAD_DIR);
            break;
        case "info":
            if (!subcommand) throw "No package or user specified.";
            if (subcommand.startsWith("usr.") || subcommand.startsWith("org."))
                await showUserInfo(subcommand);
            else await showPkgInfo(subcommand);
            break;
        case "kbd-hash":
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
            konsole.war("Remember you also need a GNU Privacy Guard (GPG) signature.");
            break;
        case "kbd-manifest-pkg":
            generateManifest();
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
            console.log("Konbini CLI", version, "for", platformString);
            console.log(
                "Written in BunJS, version",
                Bun.version,
                "(running",
                process.version,
                "of Node)",
            );
            break;
        default:
            konsole.err(
                "Unknown command. Run Konbini with no arguments to see all available commands.",
            );
            process.exit(1);
    }
}

try {
    await main();
} catch (e) {
    if (String(e).includes("EACCES")) {
        konsole.err(
            "Please run Konbini using 'sudo'; we need permission to write data to protected directories.\n      (Installs are global).",
        );
    } else {
        konsole.err(e as string);
    }
}
