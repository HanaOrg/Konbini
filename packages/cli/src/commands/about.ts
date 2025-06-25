import { konsole } from "../toolkit/konsole";

export function about() {
    konsole.adv("COPYRIGHT (C) - The Hana Organization - 2025");
    console.log("=".repeat(69));
    konsole.que("What is Konbini?");
    konsole.suc(
        '"Your convenience store", which is, by the way, what "konbini" stands for in japanese.',
    );
    konsole.adv(
        "It's a *store* for software packages made for *convenience*, with the easiest to use app,\n      non-bureaucratic publishing, actually beautiful TUI and GUI, and multi-platform support.",
    );
    konsole.que("Who made this?");
    konsole.adv(
        '"The Hana Organization". It is basically just me working on it as a solo developer at the moment, tho.',
    );
    konsole.adv(
        `Founded, developed, and maintained by ${konsole.clr("gray", "https://")}${konsole.clr("lime", "ZakaHaceCosas")}${konsole.clr("gray", ".github.io/")}.`,
    );
    konsole.adv('A huge "thank you" to my friends MrSerge01 and dimkauzh for helping me out.');
    konsole.que("I like this and want to help/I hate this and want to fix it - Can I contribute?");
    konsole.adv("Absolutely! Konbini is open source and welcomes any PRs and contributions.");
    konsole.adv(
        "Contributing your or someone else's packages to the registry is also a good (and easier) way to help!",
    );
}
