import { prompt } from "../toolkit/input";
import { isValidEmail, validate } from "@zakahacecosas/string-utils";
import { konsole, SIGNATURE_DIR } from "shared/client";
import { isAuthorId } from "shared/types/author";
import { join } from "path";
import { existsSync, mkdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "fs";
import { assertIntegrityPGP, genSignature, useSignature } from "shared/security";

async function newSignature() {
    konsole.adv(
        "We'll generate a PGP signature and store it on your hard drive (in the same folder as the Konbini installation).",
    );
    konsole.adv(
        "This utility can help you automate package publishing, as explained in our documentation.",
    );
    konsole.adv(
        "Be sure your system is safe and no user but you can access Konbini's root directory.\n",
    );
    const signer_name = await prompt(
        "Enter your name, for the signature. This is usually your full name. A username, if recognizable enough, can work too.",
        validate,
        "Type in a valid name.",
    );
    const signer_email = (await prompt(
        "Enter your email, for the signature.",
        isValidEmail,
        "Enter a valid email address.",
    )) as `${string}@${string}.${string}`;
    const passphrase_component = await prompt(
        "Write as much random stuff as you can, then hit Enter. Generating truly random noise will help keep your key hard to break.",
        (s) => validate(s) && s.length > 30,
        "Enter a valid string. Make it at least 30 characters.",
    );
    const author = await prompt(
        "Now, enter the Konbini author ID (usr.* or org.*) you want to link this signature to.",
        isAuthorId,
        "Enter a valid author ID.",
    );
    const signature = await genSignature({
        signer_name,
        signer_email,
        passphrase_component,
        author,
    });
    const signaturesPath = join(SIGNATURE_DIR, author.toLowerCase());
    if (!existsSync(signaturesPath)) mkdirSync(signaturesPath, { recursive: true });
    writeFileSync(join(signaturesPath, "passphrase"), signature.passphrase, {
        encoding: "utf-8",
    });
    writeFileSync(
        join(signaturesPath, `${author.split(".")[1]!.toLowerCase()}.asc`),
        signature.publicKey,
        {
            encoding: "utf-8",
        },
    );
    writeFileSync(
        join(signaturesPath, `${author.split(".")[1]!.toLowerCase()}_PRIVATEKEY.asc`),
        signature.privateKey,
        {
            encoding: "utf-8",
        },
    );
    konsole.out(
        "Your public signature was saved to",
        realpathSync(join(signaturesPath, `${author.split(".")[1]}.asc`)),
        "- you'll have to upload this to the author's registry together with your manifest file.",
    );
    konsole.suc("Done! Keep those signatures safe!");
    return;
}

async function applySignature() {
    const file =
        process.argv.slice(2)[2] ??
        (await prompt(
            "Enter the file you want to sign.",
            (s) => validate(s) && existsSync(s) && statSync(s).isFile(),
            "Be sure the path is valid and the file exists.",
        ));
    const author =
        process.argv.slice(2)[3] ??
        (await prompt(
            "Enter the author ID you used when generating the PGP signature with Konbini.",
            (s) => isAuthorId(s) && existsSync(join(SIGNATURE_DIR, s.toLowerCase())),
            "Be sure the author ID is valid and a signature associated to it exists locally.",
        ));

    const signaturePath = join(SIGNATURE_DIR, author.toLowerCase());
    const passphrasePath = join(signaturePath, "passphrase");
    const privateKeyPath = join(
        signaturePath,
        `${author.split(".")[1]!.toLowerCase()}_PRIVATEKEY.asc`,
    );

    if (!existsSync(signaturePath)) throw `No signature found. Is ${author} a valid author ID?`;
    if (!existsSync(passphrasePath))
        throw `No signature passphrase found. This signature is either empty/invalid, or somehow lost its passphrase. Cannot sign.`;
    if (!existsSync(privateKeyPath))
        throw `No signature private key found. This signature is either empty/invalid, or somehow lost its keyfile. Cannot sign.`;

    konsole.dbg("SIGNING", realpathSync(file), "WITH", author, "'s STORED PGP SIGNATURE");

    const passphrase = readFileSync(passphrasePath, { encoding: "utf-8" });
    const privateKey = readFileSync(privateKeyPath, { encoding: "utf-8" });
    const binary = readFileSync(file);

    const signature = await useSignature({
        passphrase,
        privateKey,
        binary,
    });

    const newSignaturePath = join(file + ".asc");

    writeFileSync(newSignaturePath, signature, { encoding: "utf-8" });

    konsole.dbg("ASSERTING INTEGRITY OF DETACHED SIGNATURE (just in case)");

    const a = await assertIntegrityPGP({
        executableFilePath: file,
        executableAscFilePath: file + ".asc",
        authorAscFilePath: join(signaturePath, `${author.split(".")[1]!.toLowerCase()}.asc`),
    });
    if (a !== "valid") throw a;
    konsole.dbg("INTEGRITY ASSERTED, SIGNATURE IS READY TO GO");

    konsole.suc("Wrote file signature to", newSignaturePath, "successfully!");
}

export async function sign(cmd: "new" | "apply") {
    if (cmd === "new") await newSignature();
    else await applySignature();
}
