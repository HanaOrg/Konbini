import { version } from "../package.json";
import { konsole } from "shared/client";
import { getPlatform } from "shared";
import { updateKonbini } from "./commands/update";
import { about } from "../../client/src/commands/about";

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

    if (!command) {
        console.log(
            [
                `${konsole.clr("deeppink", "Konbini Updater (KBU)")}, running for ${platformString}, version ${version}`,
                "Enter a command to get started. Available commands:",
                `> update             ${konsole.clr("grey", "// updates Konbini (does nothing if you're up to date)")}`,
                `> where              ${konsole.clr("grey", "// shows where all program files are stored")}`,
                `> about              ${konsole.clr("grey", "// shows some info about KBU")}`,
                `> -v, --version      ${konsole.clr("grey", "// shows current KBU version")}`,
            ].join("\n"),
        );
        return;
    }

    switch (command) {
        case "update":
            await updateKonbini();
            break;
        case "where":
            konsole.suc("Sure, here's where we live on your PC:");
            konsole.adv("Konbini Updater is installed at and running from", import.meta.dir);
            break;
        case "about":
            about();
            break;
        case "-v":
        case "--version":
        case "version":
        case "v":
            console.log("Konbini Updater", version, "for", platformString);
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
                "Unknown command. Run Konbini Updater with no arguments to see all available commands.",
            );
            process.exit(1);
    }
}

try {
    await main();
} catch (e) {
    if (String(e).includes("EACCES")) {
        konsole.err(
            "Please run Konbini Updater using 'sudo'; we need permission to write data to protected directories.\n      (Installs are global).",
        );
    } else {
        konsole.err(e as string);
    }
}
