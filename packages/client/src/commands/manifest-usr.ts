import { cwd } from "node:process";
import { konsole } from "shared/client";
import { isValidEmail, normalize, validate, validateAgainst } from "@zakahacecosas/string-utils";
import { isBetween } from "@zakahacecosas/number-utils";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { prompt, promptBinary } from "../toolkit/input";
import type { KONBINI_AUTHOR } from "shared/types/author";

async function personManifest(): Promise<KONBINI_AUTHOR> {
    konsole.suc(
        "Let's create your personal developer profile!\nThis utility will generate the YAML manifest for you, just answer the questions.",
    );

    const name = await prompt(
        "What's your DISPLAY name?",
        (val) => validate(val) && isBetween(val.length, 1, 100),
        "Whoops, that name is not valid. Enter a valid string between 1 and 100 characters.",
    );
    konsole.suc("Neat name,", name);

    const biography = await prompt(
        "Got a biography? (a brief, one or two lines long, description of yourself)",
        (val) => !validate(val) || (validate(val) && isBetween(val.length, 1, 200)),
        "Whoops, that slogan is not valid. Enter a valid string between 1 and 200 characters.",
    );
    konsole.suc(biography ? "Great bio!" : "No bio? Okay.");

    const website = await prompt(
        "Got a personal website address? This is optional, but recommended.\nIf you lack one, your GitHub (or similar) profile page will do.",
        // TODO: add to string-utils a URL validator
        (val) => !validate(val) || validate(val),
        "Whoops, that website URL is not valid.",
    );
    konsole.suc(website ? "Nice website." : "No website, that's ok.");

    const email = await prompt(
        "Got an email address? This is optional, but recommended.",
        (val) => !validate(val) || isValidEmail(val),
        "Whoops, that email is not valid.",
    );
    konsole.suc(email ? "Nice email." : "No email, that's ok.");

    const for_hire = await promptBinary(
        "Want to set yourself as 'for hire'? It'll show a small badge next to your name.",
        "Great. Hope you get hired soon btw.",
        "Alright then, no badge.",
    );

    const org = await prompt(
        "Want to highligh an organization you work with?\nIf they're on Konbini you should use their ID (org.xxx), otherwise a plain name works as well.",
        (val) => !validate(val) || validate(val),
        "",
    );
    konsole.suc(org ? `${org} will be highlighted at your profile.` : "No org, tha's okay.");

    konsole.adv("Your base manifest is done!");

    return {
        name,
        biography,
        website,
        email,
        for_hire,
        verified: false,
    };
}

async function orgManifest(): Promise<KONBINI_AUTHOR> {
    konsole.suc(
        "Let's create your organization's developer profile!\nThis utility will generate the YAML manifest for you, just answer the questions.",
    );

    const name = await prompt(
        "What's your org's DISPLAY name?",
        (val) => validate(val) && isBetween(val.length, 1, 100),
        "Whoops, that name is not valid. Enter a valid string between 1 and 100 characters.",
    );
    konsole.suc("Neat name,", name);

    const type: "corp" | "foss" | "govt" | "other" | "collab" = (await prompt(
        "What kind of organization is this? Enter one of the following values:\n- corp - if it's a private company or similar\nfoss - if it's a non-profit or similar\ngovt - if it's a public / governmental organization\ncollab - if it's just a collab org\nother - if no description suits your organization",
        (val) => validateAgainst(val, ["corp", "foss", "govt", "other", "collab"]),
        "Whoops, that's not a valid type.",
    )) as "corp" | "foss" | "govt" | "other" | "collab";
    konsole.suc("That's nice.");

    const biography = await prompt(
        "Got a biography? (a brief, one or two lines long, description of your organization)",
        (val) => !validate(val) || (validate(val) && isBetween(val.length, 1, 200)),
        "Whoops, that slogan is not valid. Enter a valid string between 1 and 200 characters.",
    );
    konsole.suc(biography ? "Great bio!" : "No bio? Okay.");

    const website = await prompt(
        "Got a website address? This is optional, but recommended.\nIf you lack one, your GitHub (or similar) profile page will do.",
        // TODO: add to string-utils a URL validator
        (val) => !validate(val) || validate(val),
        "Whoops, that website URL is not valid.",
    );
    konsole.suc(website ? "Nice website." : "No website, that's ok.");

    const email = await prompt(
        "Got an email address? This is optional, but recommended.",
        (val) => !validate(val) || isValidEmail(val),
        "Whoops, that email is not valid.",
    );
    konsole.suc(email ? "Nice email." : "No email, that's ok.");

    const for_hire = await promptBinary(
        "Want to set your organization as 'hiring'? It'll show a small badge next to your name.",
        "Great!",
        "Alright then, no badge.",
    );

    konsole.adv("Your base manifest is done!");

    return {
        name,
        biography,
        website,
        email,
        for_hire,
        verified: false,
        type:
            type === "collab"
                ? "COLLAB_ORG"
                : type === "corp"
                  ? "PRIVATE_CORP"
                  : type === "foss"
                    ? "NON_PROFIT"
                    : type === "govt"
                      ? "GOVT_ORG"
                      : "OTHER",
    };
}

export async function generateUsrManifest() {
    const usrOrOrg: "usr" | "org" = (await prompt(
        "Enter 'usr' if you want a personal manifest or 'org' if you want an organization one.",
        (input) => validateAgainst(input, ["usr", "org"]),
        "Whoops, enter either 'usr' or 'org'.",
    )) as "usr" | "org";

    const manifest = usrOrOrg === "usr" ? await personManifest() : await orgManifest();

    const id = await prompt(
        `LAST THING FOR REAL, what do you want your ID to be?\nAlphanumeric characters + dashes only, will be the X part in "${usrOrOrg}.X".`,
        (val) => validate(val) && isBetween(val.length, 1, 100) && normalize(val) == val,
        "Invalid ID.",
    );

    writeFileSync(join(cwd(), `${id}.yaml`), Bun.YAML.stringify(manifest, null, 4));

    konsole.suc(
        `Wrote this manifest to '${id}.yaml' in the current directory.\nYou can now edit it or use it to setup your profile!`,
    );
    konsole.out(
        "Keep in mind there are some optional properties we recommend you to manually add (especially your socials, if any).",
    );
}
