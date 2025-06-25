// TODO - review this and remove optional stuff, to keep it brief
import { cwd } from "node:process";
import { konsole } from "../toolkit/konsole";
import { kominator, validate, validateAgainst } from "@zakahacecosas/string-utils";
import { isBetween } from "@zakahacecosas/number-utils";
import { stringify } from "yaml";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { prompt, promptBinary, promptScope } from "../toolkit/input";
import {
    CATEGORIES,
    type KONBINI_AUTHOR_ID,
    type KONBINI_MANIFEST,
    type CATEGORY,
    type LICENSE,
    isKps,
    LICENSES,
} from "shared";

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

    const license = await prompt(
        "Package license? Must be either one of the following:\n" +
            LICENSES.map((x) => `"${x}"`).join(", ") +
            "\nor nothing (just hit enter) for an unspecified license (not recommended, though).",
        (val) => !validate(val) || validateAgainst(val, LICENSES),
        "Whoops, that license seems invalid...",
    );
    konsole.suc(validate(license) ? "Good!" : "No license? Well, okay...");

    const icon = await prompt(
        "Icon URL? If given, it must start with https:// and point to a WEBP file. It'll be shown in the Konbini UI.\nLeave blank for no icon (not recommended).",
        (val) =>
            !validate(val) ||
            (validate(val) && val.startsWith("https://") && val.endsWith(".webp")),
        "Whoops, this doesn't look right. Be sure the URL is valid.",
    );
    konsole.suc(
        validate(icon)
            ? `This icon looks awesome for sure!`
            : "No icon? Well, we'll do without it...",
    );

    const categories = await prompt(
        "Categories? If any, they must be one of the following (without the double quotes):\n" +
            CATEGORIES.join(", ") +
            "\n" +
            "If you don't want to specify any, just hit enter. We recommend at least one category, though.\nSeparate them by commas (,).",
        (val) =>
            !validate(val) ||
            (validate(val) &&
                kominator(val)
                    .map((s) => s.trim().toUpperCase())
                    .map((s) => validateAgainst(s, CATEGORIES))
                    .every((v) => v == true)),
        "Whoops, this doesn't look right. List all categories using commas and be sure they're valid.",
    );
    konsole.suc(
        validate(categories)
            ? `These ${kominator(categories).length} categories sure fit your package!`
            : "No categories? Okay...",
    );

    const author_id: KONBINI_AUTHOR_ID = (await prompt(
        "[ · ] Your author ID? (e.g. usr.johndoe) (be sure it exists!)",
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
        "[ · ] For age guidance, does your package or app require the user to grant or deny consent over user data treatment? (Y/N)",
        "Got it, there's consent over data privacy to be granted. This may make your app unavailable for too young people.",
        "Got it, no data sharing. That's actually nice!",
    );

    const platLinux64 = await promptScope("Linux64");
    const platLinuxARM = await promptScope("LinuxARM");
    const platMac64 = await promptScope("mac64");
    const platMacARM = await promptScope("macARM");
    const platWin64 = await promptScope("Windows64");

    const repository: `${string}/${string}` = (await prompt(
        '[ · ] GitHub repository? (in the author/repo format, no "github.com" or whatever)',
        (val) => validate(val) && val.split("/").length == 2,
        "Whoops, that doesn't seem like a valid GitHub repo.",
    )) as `${string}/${string}`;
    konsole.suc("Great!");

    konsole.adv("Your manifest is done!");

    const manifest: KONBINI_MANIFEST = {
        name,
        author_id,
        slogan,
        desc,
        icon: validate(icon) ? (icon as `https://${string}.webp`) : null,
        categories: kominator(categories).map((s) => s.trim().toUpperCase()) as CATEGORY[],
        age_rating: {
            money,
            social,
            substances,
            violence,
            telemetry,
        },
        license: validate(license) ? (license as LICENSE) : null,
        repository,
        platforms: {
            linux64: isKps(platLinux64) ? platLinux64 : null,
            linuxARM: isKps(platLinuxARM) ? platLinuxARM : null,
            mac64: isKps(platMac64) ? platMac64 : null,
            macARM: isKps(platMacARM) ? platMacARM : null,
            win64: isKps(platWin64) ? platWin64 : null,
        },
    };

    writeFileSync(join(cwd(), "konbini-manifest.yaml"), stringify(manifest));

    konsole.suc(
        "Wrote this manifest to 'konbini-manifest.yaml' in the current directory. You can now use it to publish your package!",
    );
}
