/** Parses a CHANGELOG in the Keep A Changelog format. */
export function parseKAChangelog(changelog: string): string | null {
    const lines = changelog.split("\n");
    const start = lines.findIndex((s) =>
        /\[\d+\.\d+\.\d+\] \(\d+-\d+-\d+\)/.test(s.trim().toLowerCase()),
    );
    if (start == -1) return null;
    const slice1 = lines.slice(start);
    const slice2 = slice1.slice(1).findIndex((s) => s.startsWith("## "));
    return slice1
        .slice(0, slice2 === -1 ? undefined : slice2)
        .join("\n")
        .trim();
}
