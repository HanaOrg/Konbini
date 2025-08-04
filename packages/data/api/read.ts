import type { VercelRequest, VercelResponse } from "@vercel/node";
import geoip from "geoip-lite";
import { Redis } from "@upstash/redis";

// things from zakahacecosas/string-utils that because of NodeJS we can't just bring here

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

// actual API

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method !== "GET") {
            res.status(405).send("Only GET allowed");
            return;
        }

        const { app } = req.query;

        if (!validate(app)) return res.status(400).json({ error: "Bad request: No app specified" });

        // checks we're alright
        const url = process.env["UPSTASH_REDIS_REST_URL"];
        const token = process.env["UPSTASH_REDIS_REST_TOKEN"];

        if (!url || !token) {
            throw new Error("Missing UPSTASH env variables! Cannot operate.");
        }

        const db = new Redis({
            url,
            token,
        });

        const downloads = (await db.lrange("downloads", 0, -1))
            .map((s) => JSON.parse(s))
            .filter((i) => i.app == app).length;
        const removals = (await db.lrange("removals", 0, -1))
            .map((s) => JSON.parse(s))
            .filter((i) => i.app == app).length;
        const product = downloads - removals;

        res.status(200).json({
            downloads,
            removals,
            product,
        });
        return;
    } catch (error) {
        res.status(500).json({ message: "Internal error: " + String(error) });
        return;
    }
}
