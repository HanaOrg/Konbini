// things from strings-utils that because of NodeJS and CJS we can't just use here

function normalize(str: any): string {
    if (str === undefined || str === null || typeof str !== "string" || str.trim() == "") return "";
    const normalizedStr = str
        .normalize("NFD") // normalize á, é, etc.
        .replace(/[\u0300-\u036f]/g, "") // remove accentuation
        .replace(/\s+/g, " ") // turn "my      search  query" into "my search query"
        .trim() // turn "      my search query   " into "my search query"
        .replace(/[\s\W_]/g, ""); // remove ANY special char

    return normalizedStr;
}

function validate(str: any): str is string {
    if (str === undefined || str === null || typeof str !== "string" || normalize(str) === "") {
        return false;
    }

    return true;
}

function validateAgainst<T extends string>(str: unknown, against: readonly T[]): str is T {
    return typeof str === "string" && validate(str as T) && against.includes(str as T);
}

// origin validation

function isValidOrigin(req: any, res: any): boolean {
    const origin = req.headers.origin;

    if (
        origin &&
        (origin.includes("localhost:") ||
            ["https://konbini.vercel.app", "https://konbini-data.vercel.app"].includes(
                origin.trim(),
            ))
    ) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        return true;
    }

    return false;
}

module.exports = { isValidOrigin, validate, validateAgainst, normalize };
