import { cwd } from "node:process";
import { konsole } from "../toolkit/konsole";
import { validate } from "@zakahacecosas/string-utils";
import { isBetween } from "@zakahacecosas/number-utils";
import { stringify } from "yaml";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { prompt, promptBinary } from "../toolkit/input";

export async function generateManifest() {
    konsole.suc(
        "Let's become Konbini developers! This utility will generate your YAML manifest for you, just answer the questions.",
    );
    konsole.adv('Questions preceded with a "[ · ]" are mandatory.');

    const name = await prompt(
        "[ · ] Your display name? (not unique, supports spaces and caps, unlike your identifier)",
        (val) => validate(val) && isBetween(val.length, 1, 100),
        "Whoops, that name is not valid. Enter a valid string between 1 and 100 characters.",
    );
    konsole.suc("Neat name,", name);

    const organization = await promptBinary(
        "[ · ] Is this your organization? Hit 'Y' if it is, 'N' if it's just you.",
        "Okay then, organization setup.",
        "Okay the, user setup.",
    );

    if (organization) {
    }

    konsole.adv("Your manifest is done!");

    const manifest = {
        name,
    };

    writeFileSync(join(cwd(), "konbini-manifest.yaml"), stringify(manifest));

    konsole.suc(
        "Wrote this manifest to 'konbini-manifest.yaml' in the current directory. You can now use it to publish your package!",
    );
}
