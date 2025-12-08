import { execSync } from "child_process";
import { ALIASED_CMDs } from "./alias-cmds";
import type { PARSED_KPS } from "shared/types/manifest";
import { normalize } from "strings-utils";

/** Gets the installed version of a package from an aliased package manager.
 *
 * @param {PARSED_KPS} target KPS to look for.
 * @returns The version string.
 */
export function getAliasedPackageVersion(target: PARSED_KPS): string {
    if (target.src === "kbi") throw "Illegal: passed KBI scope to alias-only function.";
    const out = execSync(ALIASED_CMDs[target.src].list!).toString();
    return normalize(out, { preserveCase: true }).split(" ")[1]!;
}
