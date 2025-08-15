import type { VercelRequest, VercelResponse } from "@vercel/node";
import { validate } from "../utils.js";
import * as KDATA_PER_AUTHOR_ID from "./kdata_per_author_id.json";
import * as KDATA_PER_DOWNLOADS from "./kdata_per_downloads.json";
import * as KDATA_PER_RELEASES from "./kdata_per_releases.json";
import * as KDATA_PER_CATEGORY from "./kdata_per_category.json";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const origin = req.headers.origin;

        if (
            origin &&
            (origin.startsWith("http://localhost:") ||
                ["https://konbini.vercel.app", "https://konbini-data.vercel.app"].includes(
                    origin.trim(),
                ))
        ) {
            res.setHeader("Access-Control-Allow-Origin", origin);
        }
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        if (req.method === "OPTIONS") {
            res.status(200).end();
            return;
        }

        if (req.method !== "GET") {
            res.status(405).send("Only GET allowed");
            return;
        }

        const { sorting, entries } = req.query;

        if (!validate(sorting))
            return res.status(400).json({ error: "Bad request: No sorting method specified." });
        if (!["a", "c", "d", "r"].includes(sorting))
            return res.status(400).json({ error: "Bad request: Invalid sorting method." });

        const num = !validate(entries) || !isNaN(Number(entries)) ? undefined : Number(entries);
        const delivery = Object.fromEntries(
            Object.entries(
                sorting === "a"
                    ? KDATA_PER_AUTHOR_ID
                    : sorting === "c"
                      ? KDATA_PER_CATEGORY
                      : sorting === "d"
                        ? KDATA_PER_DOWNLOADS
                        : KDATA_PER_RELEASES,
            ).slice(0, num),
        );

        res.status(200).json(delivery);
        return;
    } catch (error) {
        res.status(500).json({ message: "Internal error: " + String(error) });
        return;
    }
}
