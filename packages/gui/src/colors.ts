function parseHex(hex: string): { r: number; g: number; b: number } {
    hex = hex.replace("#", "");

    return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
    };
}

export function lightenHex(hex: string, amount: number): `#${string}` {
    let { r, g, b } = parseHex(hex);

    r = Math.max(Math.min(255, r + amount), 0);
    g = Math.max(Math.min(255, g + amount), 0);
    b = Math.max(Math.min(255, b + amount), 0);

    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

export function getContrastingTextColor(hex: string) {
    let { r, g, b } = parseHex(hex);

    // https://stackoverflow.com/a/11868159
    const bright = Math.round((r * 299 + g * 587 + b * 114) / 1000);

    return bright > 125 ? "#000000" : "#FFFFFF";
}

export function accentPage(color: string | undefined) {
    const accent = color ? lightenHex(color, 40) : lightenHex("#c23282", 170);
    document.documentElement.style.setProperty("--k", accent);
    document.documentElement.style.setProperty("--k-dimmed", lightenHex(accent, -40) + "40");
    document.documentElement.style.setProperty("--k-lighter", lightenHex(accent, 80));
}
