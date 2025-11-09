// origin validation

export function isValidOrigin(req: any, res: any): boolean {
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
