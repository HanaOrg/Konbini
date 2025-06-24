import { konbiniHash } from "shared";
import { konsole } from "../toolkit/konsole";
import { fileURLToPath } from "url";

export function learn(subcommand: string | undefined) {
    if (!subcommand) {
        konsole.war('Available topics for learning are: "hash".');
    }
    if (subcommand === "hash") {
        const filePath = fileURLToPath(import.meta.url);
        konsole.adv("Here's an example Konbini HASH for the Konbini binary itself.");
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
        return;
    }
    konsole.err('Invalid item. Available topics for learning are: "hash".');
}
