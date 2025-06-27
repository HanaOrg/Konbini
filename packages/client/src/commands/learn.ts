import { konbiniHash } from "shared";
import { konsole } from "shared/client";
import { fileURLToPath } from "url";

export function learn(subcommand: string | undefined) {
    if (!subcommand) {
        konsole.war('Available topics for learning are: "hash", "sign".');
    }
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
    konsole.err('Invalid item. Available topics for learning are: "hash", "sign".');
}
