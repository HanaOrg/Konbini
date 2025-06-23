import * as openpgp from "openpgp";
import { readFileSync } from "fs";

/** Konbini Security Module: GPG */
export namespace KbiSecGPG {
    /** Asserts the integrity of a given executable, taking both the author's signature and the binary signature. */
    export async function assertIntegrity(params: {
        executableFilePath: string;
        executableAscFilePath: string;
        authorAscFilePath: string;
    }): Promise<"error" | "non-compliant" | "non-valid" | "valid"> {
        const { executableFilePath, executableAscFilePath, authorAscFilePath } = params;

        // load data
        const publicKeyArmored = readFileSync(authorAscFilePath, "utf8");
        const signatureArmored = readFileSync(executableAscFilePath, "utf8");
        const signedBinary = readFileSync(executableFilePath, null); // No encoding

        const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
        const signature = await openpgp.readSignature({ armoredSignature: signatureArmored });

        // verify the signature
        const verification = await openpgp.verify({
            message: await openpgp.createMessage({ binary: signedBinary }),
            signature,
            verificationKeys: publicKey,
        });

        const verificationResult = verification.signatures[0];

        if (!verificationResult) return "error";

        // result
        const res = await verificationResult.verified;
        if (res === true) {
            return "valid";
        } else {
            return "non-valid";
        }
        // hope we find a way to return "non-compliant" for non GPG-SHA512 signatures
    }
    /** Simply validates a signature is valid (based on format). Doesn't assert the safety of any package, but avoids the unnecessary redownload of signatures each time a package is installed or updated. */
    export async function validateSignature(ascFilePath: string): Promise<boolean> {
        try {
            const signature = await openpgp.readSignature({
                binarySignature: new Uint8Array(readFileSync(ascFilePath)),
            });

            return signature.packets.length > 0;
        } catch {
            return false;
        }
    }
}
