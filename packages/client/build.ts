import type { Build } from "bun";
import { version } from "../../package.json";
import { konsole } from "shared/client";

const platforms: Record<string, Build.Target> = {
    "kbi.exe": "bun-windows-x64",
    "kbi-linux64": "bun-linux-x64",
    "kbi-linuxArm": "bun-linux-arm64",
    "kbi-mac64": "bun-darwin-x64",
    "kbi-macArm": "bun-darwin-arm64",
    "kpak-sfx-win64.exe": "bun-windows-x64",
    "kpak-sfx-linux64": "bun-linux-x64",
    "kpak-sfx-linuxArm": "bun-linux-arm64",
    "kpak-sfx-mac64": "bun-darwin-x64",
    "kpak-sfx-macArm": "bun-darwin-arm64",
};

for (const [pkg, platform] of Object.entries(platforms)) {
    konsole.adv(`Building ${pkg} for platform ${platform}...`);
    try {
        const src = pkg.startsWith("kpak") ? "../konpak/index.ts" : "./src/index.ts";
        const title = pkg.startsWith("kpak") ? "KPAK SFX" : "Konbini";
        const description = pkg.startsWith("kpak")
            ? "Konpak Self Extractable Module (KPAK-SFX). Used to convert Konpaks into self-extractable archives."
            : "Your convenience store.";

        const res = await Bun.build({
            entrypoints: [src],
            minify: true,
            throw: false,
            sourcemap: "inline",
            footer: "// why are you reading a binary?",
            compile: {
                target: platform,
                outfile: `./dist/${pkg}`,
                windows: {
                    hideConsole: false,
                    icon: "./konbini.ico",
                    title,
                    publisher: "Hana",
                    version,
                    description,
                    copyright: "© 2025 The Hana Org",
                },
            },
        });

        if (!res.success) throw res.logs.join("\n");

        konsole.suc(`${pkg} built successfully.`);
    } catch (e) {
        konsole.err(`Error building ${pkg}: ${String(e).trim()}.`);
        process.exit(1);
    }
}
