import { Konpak } from "./src/pack";
import { Unpack } from "./src/unpack";

export function debug(...args: string[]) {
    if (true) console.log(args);
}

function pack() {
    const appId = prompt("App ID?");
    const version = prompt("App version to be konpak'd?");
    const platform = prompt("Build a Konpak for 'windows' or 'linux'?");
    if (platform !== "windows" && platform !== "linux")
        throw new Error("Platform invalid. Either 'Windows' or 'Linux'.");
    const pathToBinary = prompt("Path to main binary file.");
    const pathToManifest = prompt("Path to manifest file.");
    console.log(
        "(You're supposed to store all dependencies (if any), libraries, and stuff for your app in the same folder.)",
    );
    const pathToDirected = prompt("Path to dependencies.");
    if (!pathToDirected) console.log("No dependencies.");
    const pathToIcon = prompt(
        "Path to icon file (.ico for a Windows Konpak, .png for a Linux one).",
    );

    if (!appId || !version || !pathToBinary || !pathToManifest || !pathToIcon || !platform)
        throw new Error("Missing required params.");

    Konpak({
        appId,
        version,
        platform,
        pathToIcon,
        pathToBinary,
        pathToManifest,
        pathToDirected,
    });
}

function unpack() {
    const path = prompt("Konpak to unpack");
    if (!path) return;

    Unpack(path);
}

function main() {
    if (process.argv[2] === "pack") pack();
    else if (process.argv[2] === "unpack") unpack();
    else console.error("Specify what to do.");
}

main();
