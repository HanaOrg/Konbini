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
        if (req.method !== "POST") {
            res.status(405).send("Only POST allowed");
            return;
        }

        const { app, version, sys, action } = req.body;

        if (!validate(app)) return res.status(400).json({ error: "Bad request: No app specified" });
        if (!validate(version))
            return res.status(400).json({ error: "Bad request: No version specified" });
        if (!validate(sys)) return res.status(400).json({ error: "Bad request: No sys specified" });
        if (!["win64", "mac64", "macArm", "linux64", "linuxArm"].includes(sys))
            return res.status(400).json({ error: "Bad request: Invalid sys specified" });
        if (!validate(action))
            return res.status(400).json({ error: "Bad request: No action specified" });
        if (!["download", "remove"].includes(action)) {
            return res.status(400).json({ error: "Bad request: Invalid action specified" });
        }

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

        // gets IP
        const forward = req.headers["x-forwarded-for"];
        const ip = forward
            ? Array.isArray(forward)
                ? forward[0]
                : forward.split(",")[0]
            : req.connection.remoteAddress;
        const geo = geoip.lookup(ip || "0.0.0.0");
        const country = (geo || { country: "unknown" }).country;

        const data = {
            app,
            version,
            sys,
            country,
            timestamp: Date.now(),
        };

        if (action === "download") {
            await db.rpush("downloads", JSON.stringify(data));
        } else {
            await db.rpush("removals", JSON.stringify(data));
        }

        res.status(200).json({ success: true });
        return;
    } catch (error) {
        res.status(500).json({ message: "Internal error: " + String(error) });
        return;
    }
}
