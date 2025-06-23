const platforms = {
    "kbi.exe": "bun-windows-x64",
    "kbi-linux-x64": "bun-linux-x64",
    "kbi-linux-arm64": "bun-linux-arm64",
    "kbi-macos-x64": "bun-darwin-x64",
    "kbi-macos-arm64": "bun-darwin-arm64",
};

for (const [name, platform] of Object.entries(platforms)) {
    console.log(`Building ${name} for platform ${platform}...`);
    const cmd = [
        "bun",
        "build",
        "--compile",
        "--minify",
        "--sourcemap",
        "--outfile",
        `./dist/${name}`,
        `--target=${platform}`,
        "./src/index.ts",
    ];
    console.debug(cmd);
    const exec = Bun.spawnSync({
        cmd,
        cwd: process.cwd(),
    });

    if (exec.exitCode !== 0) {
        console.error(`Error building ${name}.`);
        process.exit(1);
    } else {
        console.log(`${name} built successfully.`);
    }
}
