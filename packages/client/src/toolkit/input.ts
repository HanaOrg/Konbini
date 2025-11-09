import { stdin as input, stdout as output } from "node:process";
import { validate, validateAgainst } from "strings-utils";
import { konsole } from "shared/client";
import { createInterface } from "node:readline/promises";
import { type KONBINI_PKG_SCOPE, isKps } from "shared/types/manifest";

async function ask(q: string): Promise<string> {
    const rl = createInterface({ input, output });

    const ans = await rl.question(konsole.clr("cyan", q + " =>\n"));

    rl.close();

    return ans;
}

export async function prompt(
    message: string,
    validator: (input: string) => boolean,
    error: string,
): Promise<string> {
    let input = await ask("[ ? ] " + message);
    while (!validator(input)) {
        konsole.war(error);
        input = await ask(message);
    }
    return input;
}

export async function promptScope(platform: string): Promise<KONBINI_PKG_SCOPE | null> {
    const input = await prompt(
        `[ ? ] Scope for ${platform}. Hit enter without typing anything if your package isn't available on ${platform}.`,
        (val) => {
            if (!val) return true;
            return isKps(val);
        },
        `Whoops, that doesn't look like a valid scope. Scopes follow the SRC:VAL format, read more on our documentation (<https://github.com/HanaOrg/Konbini/blob/main/doc/README.md>)`,
    );

    konsole.suc(
        validate(input)
            ? input.startsWith("kbi")
                ? `${platform} Konbini package, got it!`
                : `${platform} aliased package, got it!`
            : `No ${platform}, alright.`,
    );

    return isKps(input) ? input : null;
}

export async function promptBinary(message: string, y: string, n: string): Promise<boolean> {
    // no, i didn't forget about konsole.ask
    // if used, it errors here because it conflicts with the interface we created in this file to prompt stuff
    const val = await prompt(
        "[y/n] " + message,
        (val) => validate(val) && validateAgainst(val.toLowerCase(), ["y", "n"]),
        "Type 'y' (YES) or 'n' (NO), nothing else.",
    );
    const result = val.toLowerCase() === "y";
    konsole.suc(result ? y : n);
    return result;
}
