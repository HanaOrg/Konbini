import type { KPS_SOURCE } from "shared/types/manifest";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { CFG_DIR } from "shared/client";

export function getTpmList(): Partial<Record<KPS_SOURCE, boolean>> {
    const defaultTpmList: Record<KPS_SOURCE, boolean> = {
        "kbi": true,
        "apt": false,
        "brew-k": false,
        "cho": false,
        "brew": false,
        "fpak": false,
        "nix": false,
        "scp": false,
        "snap": false,
        "snap-c": false,
        "wget": false,
    };
    const path = join(CFG_DIR, "tpm.yaml");
    if (!existsSync(path)) {
        writeFileSync(
            path,
            `# this file manages trusted package managers\n# feel free to tweak it\n# value for 'kbi' is ignored ;)\n# if file is wiped / removed, all managers are untrusted (and nothing explodes 👍)\n${Bun.YAML.stringify(defaultTpmList)}`,
        );
        return defaultTpmList;
    }
    try {
        return Bun.YAML.parse(readFileSync(path).toString("utf-8")) as Partial<
            Record<KPS_SOURCE, boolean>
        >;
    } catch {
        return defaultTpmList;
    }
}

/** checks if given KPS_SOURCE is a trusted package manager */
export function isTpm(mgr: KPS_SOURCE): boolean {
    if (mgr === "kbi") return true;
    return getTpmList()[mgr] || false;
}

export function trustPackageManager(mgr: KPS_SOURCE): void {
    if (mgr === "kbi") return;
    const list = getTpmList();
    list[mgr] = true;
    writeFileSync(
        join(CFG_DIR, "tpm.yaml"),
        `# this file manages trusted package managers\n# feel free to tweak it\n# value for 'kbi' is ignored ;)\n# if file is wiped / removed, all managers are untrusted (and nothing explodes 👍)\n${Bun.YAML.stringify(list)}`,
    );
}

export function untrustPackageManager(mgr: KPS_SOURCE): void {
    if (mgr === "kbi") return;
    const list = getTpmList();
    list[mgr] = false;
    writeFileSync(
        join(CFG_DIR, "tpm.yaml"),
        `# this file manages trusted package managers\n# feel free to tweak it\n# value for 'kbi' is ignored ;)\n# if file is wiped / removed, all managers are untrusted (and nothing explodes 👍)\n${Bun.YAML.stringify(list)}`,
    );
}
