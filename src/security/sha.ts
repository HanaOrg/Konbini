import { readFileSync } from "fs";

/** Konbini Security Module: SHA */
export namespace KbiSecSHA {
    /**
     * Hashes a file using Bun's builtin `CryptoHasher`. It uses **SHA3-512**, the safest version of SHA out there.
     * Returns the file hash in a `base64url`-formatted string.
     */
    export function hash(fileName: string): string {
        const file = readFileSync(fileName);
        // create the hasher
        const hasher = new Bun.CryptoHasher("sha3-512");
        // pass the file buffer
        hasher.update(file);
        // hash it
        return hasher.digest("base64url");
    }
    /**
     * Asserts integrity of a file against a provided `base64url`-encoded **SHA3-512** hash.
     *
     * @param {string} fileName
     * @param {string} expectedB64URLhash
     * @returns {boolean} True if the hashes DO match, false if they DO NOT.
     */
    export function assertIntegrity(fileName: string, expectedB64URLhash: string): boolean {
        const calculatedHash = hash(fileName);
        // compare the hashes. they must be exactly the same, otherwise stuff ain't alright.
        return calculatedHash === expectedB64URLhash;
    }
}
