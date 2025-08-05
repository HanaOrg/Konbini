import { konsole } from "shared/client";
import { konbiniHash } from "shared/security";
import { fileURLToPath } from "url";

export function learn(subcommand: string | undefined) {
    if (subcommand === "hash") {
        const filePath = fileURLToPath(import.meta.url);
        konsole.adv("Here's an example Konbini HASH, for the Konbini binary itself.");
        konsole.suc(konbiniHash(filePath));
        konsole.adv(
            "The above is a SHA3-512 compliant hash. It's required for EVERYTHING released to Konbini.",
        );
        konsole.dbg('You may already know what a "hash" is, but we\'ll explain just in case:');
        [
            "A hash validates the integrity of a file, so if it corrupts during download we can avoid it.",
            "We run the Konbini hasher for each installation, and compare hashes to the ones you provide.",
            "If the file downloaded by the user is corrupted, both hashes will NOT match, and we'll know.",
        ].map((s) => konsole.adv(s));
        konsole.dbg('But hey, you might have realized the above hash looks "different".');
        [
            "The hash is made with the SHA3-512 algorithm, the safest version of the Secure Hash Algorithm.",
            "It looks different because of most apps use HEX for hashes while we use BASE64URL format.",
            "Why? Because it makes the hash 88 chars long (and it'd be 128 in HEX).",
        ].map((s) => konsole.adv(s));
        konsole.suc("This is a good method to ensure integrity of downloads.");
        konsole.dbg("Be advised that aliased packages do not undergo this check.");
        return;
    }
    if (subcommand === "sign") {
        [
            "Konbini uses PGP (Pretty Good Privacy) to ensure all executables are authentic.",
            "These signatures validate authenticity.",
            "They include the signer's name and email, which can be tested against a public signature.",
            "This public signature is, for Konbini, hosted on a public registry (HanaOrg/AuthorsRegistry).",
            "If a package's signature didn't match the author's public signature, it'd mean the package file is fake.",
            "So, if a signature isn't valid, or we happen to be unable to download them, we block installs.",
        ].map((s) => konsole.adv(s));
        konsole.suc("This is a good method to ensure authenticity of downloads.");
        konsole.dbg("Be advised that aliased packages do not undergo this check.");
        return;
    }
    if (subcommand === "konpak") {
        [
            "A Konpak is a distribution format, similar to DEB files, made for Konbini.",
            "It's our recommended method for distributing:",
            "- apps with dependencies (DLLs, media files, etc...)",
            "- programs that should integrate with the OS (be listed as programs, appear in Start menu...)",
            "Just like a DEB file they require an unpacker program (Konbini).",
            "Konpaks are based on ZIP archives, providing a degree of compression.",
        ].map((s) => konsole.adv(s));
        konsole.suc("Konpaks are very easy to use for Konbini distribution.");
        konsole.dbg("Be advised that they don't work with macOS, and aren't well tested on Linux.");
        console.log("-----");
        [
            "When running 'kbi konpak <dir>' on a directory, a Konpak will be made out of it.",
            "- you'll be asked the package ID and the version of it you're konpaking",
            "- you'll also be asked if it's a Windows or a Linux Konpak (they behave differently)",
            "- and you'll also be asked the name of the main binary",
            "The directory is expected to contain:",
            "- a manifest.yaml file",
            "- a .png/.ico icon file with the same name as your package ID",
            "- any other file inside of it will be treated as a regular asset",
            "A Konpak will be immediately generated and saved to the CWD.",
        ].map((s) => konsole.adv(s));
        return;
    }
    konsole.err('Invalid item. Available topics for learning are: "hash", "sign", "konpak".');
    return;
}
