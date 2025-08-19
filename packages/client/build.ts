import { konsole } from "shared/client";

const platforms = {
    "kbi.exe": "bun-windows-x64",
    "kbi-linux64": "bun-linux-x64",
    "kbi-linuxAr,": "bun-linux-arm64",
    "kbi-mac64": "bun-darwin-x64",
    "kbi-macArm": "bun-darwin-arm64",
    "kbu.exe": "bun-windows-x64",
    "kbu-linux64": "bun-linux-x64",
    "kbu-linuxArm": "bun-linux-arm64",
    "kbu-mac64": "bun-darwin-x64",
    "kbu-macArm": "bun-darwin-arm64",
    "kpak-sfx-win64.exe": "bun-windows-x64",
    "kpak-sfx-linux64": "bun-linux-x64",
    "kpak-sfx-linuxArm": "bun-linux-arm64",
    "kpak-sfx-mac64": "bun-darwin-x64",
    "kpak-sfx-macArm": "bun-darwin-arm64",
};

for (const [name, platform] of Object.entries(platforms)) {
    konsole.adv(`Building ${name} for platform ${platform}...`);
    const src = name.startsWith("kbu")
        ? "../update/src/index.ts"
        : name.startsWith("kpak")
          ? "../konpak/index.ts"
          : "./src/index.ts";
    const cmd = [
        "bun",
        "build",
        "--compile",
        "--minify",
        "--sourcemap",
        "--outfile",
        // TODO: remove
        `./dist/alpha-four-${name}`,
        `${name.endsWith("exe") ? "--windows-icon=./konbini.ico" : ""}`,
        `--target=${platform}`,
        src,
    ].filter((s) => s !== "");

    const exec = Bun.spawnSync({
        cmd,
        cwd: process.cwd(),
    });

    if (exec.exitCode !== 0) {
        konsole.err(`Error building ${name}: ${exec.stderr} + ${exec.stdout}.`);
        process.exit(1);
    } else {
        konsole.suc(`${name} built successfully.`);
    }
}
