const platforms = {
    "kbi.exe": "bun-windows-x64",
    "kbi-linux-x64": "bun-linux-x64",
    "kbi-linux-arm64": "bun-linux-arm64",
    "kbi-macos-x64": "bun-darwin-x64",
    "kbi-macos-arm64": "bun-darwin-arm64",
    "kbu.exe": "bun-windows-x64",
    "kbu-linux-x64": "bun-linux-x64",
    "kbu-linux-arm64": "bun-linux-arm64",
    "kbu-macos-x64": "bun-darwin-x64",
    "kbu-macos-arm64": "bun-darwin-arm64",
};

for (const [name, platform] of Object.entries(platforms)) {
    console.log(`Building ${name} for platform ${platform}...`);
    const src = name.startsWith("kbu") ? "../update/src/index.ts" : "./src/index.ts";
    const cmd = [
        "bun",
        "build",
        "--compile",
        "--minify",
        "--sourcemap",
        "--outfile",
        `./dist/${name}`,
        `--target=${platform}`,
        src,
    ];

    const exec = Bun.spawnSync({
        cmd,
        cwd: process.cwd(),
    });

    if (exec.exitCode !== 0) {
        console.error(`Error building ${name}: ${exec.stderr} + ${exec.stdout}.`);
        process.exit(1);
    } else {
        console.log(`${name} built successfully.`);
    }
}
