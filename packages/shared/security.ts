import { createHash, randomBytes } from "node:crypto";
import {
    readKey,
    readSignature,
    verify,
    createMessage,
    sign,
    readPrivateKey,
    decryptKey,
    generateKey,
} from "openpgp";
import { readFileSync } from "node:fs";

/** Asserts the integrity of a given executable, taking both the author's signature and the binary signature. */
export async function assertIntegrityPGP(params: {
    executableFilePath: string;
    executableAscFilePath: string;
    authorAscFilePath: string;
}): Promise<"error" | "non-valid" | "valid"> {
    const { executableFilePath, executableAscFilePath, authorAscFilePath } = params;

    // load data
    const publicKeyArmored = readFileSync(authorAscFilePath, "utf8");
    const signatureArmored = readFileSync(executableAscFilePath, "utf8");
    const signedBinary = readFileSync(executableFilePath, null); // No encoding

    const publicKey = await readKey({ armoredKey: publicKeyArmored });
    const signature = await readSignature({ armoredSignature: signatureArmored });

    // verify the signature
    const verification = await verify({
        message: await createMessage({ binary: signedBinary }),
        signature,
        verificationKeys: publicKey,
    });

    const verificationResult = verification.signatures[0];

    if (!verificationResult) {
        return "error";
    }

    // result
    const res = await verificationResult.verified;
    if (res === true) {
        return "valid";
    } else {
        return "non-valid";
    }
}

/** Simply validates a signature is valid (based on format). Doesn't assert the safety of any package, but avoids the unnecessary redownload of signatures each time a package is installed or updated. */
export async function validatePGPSignature(ascFilePath: string): Promise<boolean> {
    try {
        const signature = await readSignature({
            binarySignature: new Uint8Array(readFileSync(ascFilePath)),
        });

        return signature.packets.length > 0;
    } catch {
        return false;
    }
}

/**
 * Hashes a file using NodeJS' builtin `createHash`. It uses **SHA3-512**, the safest version of SHA out there.
 * Returns the file hash in a `base64url`-formatted string.
 */
export function konbiniHash(fileName: string): string {
    const file = readFileSync(fileName);
    // create the hasher
    const hasher = createHash("sha3-512");
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
export function assertIntegritySHA(fileName: string, expectedB64URLhash: string): boolean {
    const calculatedHash = konbiniHash(fileName);
    // compare the hashes. they must be exactly the same, otherwise stuff ain't alright.
    return calculatedHash === expectedB64URLhash;
}

export async function genSignature(params: {
    passphrase_component: string;
    signer_name: string;
    signer_email: `${string}@${string}.${string}`;
}): Promise<{
    publicKey: string;
    privateKey: string;
    passphrase: string;
}> {
    const { signer_name, signer_email, passphrase_component } = params;

    const passphrase = passphrase_component + Buffer.from(randomBytes(64)).toString("base64");

    const { privateKey, publicKey } = await generateKey({
        type: "ecc",
        keyExpirationTime: 0,
        userIDs: [{ name: signer_name, email: signer_email }],
        passphrase: passphrase,
        format: "armored",
    });

    return {
        publicKey,
        privateKey,
        passphrase,
    };
}

export async function useSignature(params: {
    passphrase: string;
    privateKey: string;
    binary: Uint8Array;
}) {
    const { binary, passphrase, privateKey } = params;

    return await sign({
        message: await createMessage({ binary }),
        signingKeys: await decryptKey({
            privateKey: await readPrivateKey({ armoredKey: privateKey }),
            passphrase,
        }),
        format: "armored",
        detached: true,
    });
}
