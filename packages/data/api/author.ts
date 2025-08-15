import type { VercelRequest, VercelResponse } from "@vercel/node";
import { validate } from "../utils.js";
import * as KDATA from "./kdata_authors.json";

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

        const { id } = req.query;

        if (!validate(id))
            return res.status(400).json({ error: "Bad request: No author ID specified." });
        // @ts-expect-error
        if (!KDATA[id])
            return res
                .status(404)
                .json({ error: `Not found: Author '${id}' was not found within the registry.` });

        // @ts-expect-error
        res.status(200).json(KDATA[id]);
        return;
    } catch (error) {
        res.status(500).json({ message: "Internal error: " + String(error) });
        return;
    }
}
