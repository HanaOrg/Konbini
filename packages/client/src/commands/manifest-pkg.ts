import { cwd } from "node:process";
import { konsole } from "shared/client";
import { validate, validateAgainst } from "@zakahacecosas/string-utils";
import { isBetween } from "@zakahacecosas/number-utils";
import { stringify } from "yaml";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { prompt, promptBinary, promptScope } from "../toolkit/input";
import { type KONBINI_AUTHOR_ID, type KONBINI_MANIFEST } from "shared";
import type { REPOSITORY_SCOPE } from "shared/types/manifest";

export async function generateManifest() {
    konsole.suc(
        "Let's create a new package! This utility will generate the YAML manifest for you, just answer the questions.",
    );

    const name = await prompt(
        "[ · ] Package DISPLAY name? (supports spaces and caps, unlike its identifier)",
        (val) => validate(val) && isBetween(val.length, 1, 100),
        "Whoops, that name is not valid. Enter a valid string between 1 and 100 characters.",
    );
    konsole.suc("Neat name,", name);

    const slogan = await prompt(
        "[ · ] Package slogan? (a brief, one or two lines long, description of your package)",
        (val) => validate(val) && isBetween(val.length, 1, 200),
        "Whoops, that slogan is not valid. Enter a valid string between 1 and 200 characters.",
    );
    konsole.suc("Great slogan!");

    const desc = await prompt(
        "[ · ] Package extended description? (markdown and linebreaks (\\n) are supported)",
        (val) => validate(val) && isBetween(val.length, 1, 4096),
        "Whoops, that description is not valid. Enter a valid string between 1 and 4096 characters.",
    );
    konsole.suc("Great slogan!");

    const author_id: KONBINI_AUTHOR_ID = (await prompt(
        "[ · ] Your author ID? (e.g. usr.john-doe) (be sure it exists!)",
        (val) =>
            validate(val) &&
            val.split(".").length === 2 &&
            validateAgainst(val.split(".")[0], ["usr", "org"]),
        'Whoops, that ID is not valid. Enter a valid string starting with "usr." or "org.".',
    )) as KONBINI_AUTHOR_ID;
    konsole.suc("Nice.");

    const money: boolean = await promptBinary(
        "[ · ] For age guidance, does your package or app allow to use real currency in any way? (Y/N)",
        "Got it, money flows. This may make your app unavailable for too young people.",
        "Got it, no money moving.",
    );

    const social: boolean = await promptBinary(
        "[ · ] For age guidance, does your package or app allow to use unmonitored chats, media reels, whatsoever? (Y/N)",
        "Got it, there's social interaction. This may make your app unavailable for too young people.",
        "Got it, no social interaction.",
    );

    const substances: boolean = await promptBinary(
        "[ · ] For age guidance, does your package or app reference illegal substances or legalized drugs / alcohol in any way? (Y/N)",
        "Got it, smells like drugs around here. This may make your app unavailable for too young people.",
        "Got it, no drugs. That's nice.",
    );

    const violence: boolean = await promptBinary(
        "[ · ] For age guidance, does your package or app show scenes of real, graphical violence in any case? (Y/N)",
        "Got it, this thing is violent. This may make your app unavailable for too young people.",
        "Got it, no violence. That's nice.",
    );

    const telemetry: boolean = await promptBinary(
        "[ · ] Does your package or app require the user to grant or deny consent over user data treatment? (Y/N)",
        "Got it, there's consent over data privacy to be granted. This will be visible in store.",
        "Got it, no data sharing. That's actually nice!",
    );

    const linux64 = await promptScope("Linux64");
    const linuxArm = await promptScope("LinuxARM");
    const mac64 = await promptScope("mac64");
    const macArm = await promptScope("macArm");
    const win64 = await promptScope("Windows64");

    const repository: REPOSITORY_SCOPE = (await prompt(
        'Repository? (in the provider:author/repo format, being provider "gh", "gl", or "cb")',
        (val) => !validate(val) || (validate(val) && val.split("/").length == 2),
        "Whoops, that doesn't seem like a valid GitHub repo.",
    )) as REPOSITORY_SCOPE;
    konsole.suc("Great!");

    konsole.adv("Your manifest is done!");

    const manifest: KONBINI_MANIFEST = {
        name,
        author_id,
        slogan,
        desc,
        telemetry,
        age_rating: {
            money,
            social,
            substances,
            violence,
        },
        repository,
        categories: [],
        license: null,
        platforms: {
            linux64,
            linuxArm,
            mac64,
            macArm,
            win64,
        },
    };

    writeFileSync(join(cwd(), "konbini-manifest.yaml"), stringify(manifest));

    konsole.suc(
        "Wrote this manifest to 'konbini-manifest.yaml' in the current directory. You can now use it to publish your package!",
    );
    konsole.out("Keep in mind there are many optional properties we recommend you to specify.");
}
