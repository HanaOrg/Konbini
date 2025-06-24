import { konsole } from "../toolkit/konsole";

export function about() {
    konsole.adv("COPYRIGHT (C) - The Hana Organization - 2025");
    console.log("=".repeat(69));
    konsole.dbg("What is Konbini?");
    konsole.suc(
        '"Your convenience store", which is, by the way, what Konbini stands for in japanese.',
    );
    konsole.adv(
        "It's a *store* for software packages made for *convenience*, with the easiest to use CLI,\n      non-bureaucratic publishing, software safety out of the box, and a nice TUI (and soon GUI).",
    );
    konsole.dbg("Who made this?");
    konsole.adv(
        '"The Hana Organization", though it is pretty much me maintaining it as a solo developer at the moment.',
    );
}
