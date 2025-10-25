import { cwd } from "node:process";
import { konsole } from "shared/client";
import { validate, validateAgainst } from "@zakahacecosas/string-utils";
import { isBetween } from "@zakahacecosas/number-utils";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { prompt, promptBinary, promptScope } from "../toolkit/input";
import type { KONBINI_MANIFEST, REPOSITORY_SCOPE } from "shared/types/manifest";
import type { KONBINI_ID_USR } from "shared/types/author";

export async function generatePkgManifest() {
    konsole.suc(
        "Let's create a new package!\nThis utility will generate the YAML manifest for you, just answer the questions.",
    );

    const name = await prompt(
        "Package DISPLAY name? (supports spaces and caps, unlike its identifier)",
        (val) => validate(val) && isBetween(val.length, 1, 100),
        "Whoops, that name is not valid. Enter a valid string between 1 and 100 characters.",
    );
    konsole.suc("Neat name,", name);

    const slogan = await prompt(
        "Package slogan? (a brief, one or two lines long, description of your package)",
        (val) => validate(val) && isBetween(val.length, 1, 200),
        "Whoops, that slogan is not valid. Enter a valid string between 1 and 200 characters.",
    );
    konsole.suc("Great slogan!");

    const desc = await prompt(
        "Package extended description? (markdown and linebreaks (\\n) are supported)",
        (val) => validate(val) && isBetween(val.length, 1, 4096),
        "Whoops, that description is not valid. Enter a valid string between 1 and 4096 characters.",
    );
    konsole.suc("Great description!");

    const type: "cli" | "gui" | "both" = (
        await prompt(
            "Is your app a CLI, a GUI (graphical app), or can it be used in BOTH manners?",
            (val) => validate(val) && validateAgainst(val.toLowerCase(), ["cli", "gui", "both"]),
            'Whoops, that is not valid. Enter a valid string, either "cli", "gui", or "both".',
        )
    ).toLowerCase() as "cli" | "gui" | "both";
    konsole.suc("Nice.");

    const author: KONBINI_ID_USR = (await prompt(
        "Your author ID? (e.g. usr.john-doe) (be sure it exists!)",
        (val) =>
            validate(val) &&
            val.split(".").length === 2 &&
            validateAgainst(val.split(".")[0], ["usr", "org"]),
        'Whoops, that ID is not valid. Enter a valid string starting with "usr." or "org.".',
    )) as KONBINI_ID_USR;
    konsole.suc("Nice.");

    const telemetry: boolean = await promptBinary(
        "Does your package or app require the user to grant or deny consent over user data treatment? (Y/N)",
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

    konsole.adv(
        "Your base manifest is done!\nYou might want to add some final data:\n- License\n- Age guiding info\n- Accent color\n- Website\n- etc...",
    );

    const manifest: KONBINI_MANIFEST = {
        name,
        type,
        author,
        slogan,
        desc,
        telemetry,
        age_rating: {
            money: false,
            social: false,
            substances: false,
            violence: false,
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

    writeFileSync(join(cwd(), "konbini-manifest.yaml"), Bun.YAML.stringify(manifest));

    konsole.suc(
        "Wrote this manifest to 'konbini-manifest.yaml' in the current directory.\nYou can now edit it or use it to publish your package!",
    );
    konsole.out(
        "Keep in mind there are many optional properties we recommend you to manually add (especially a license).",
    );
}
