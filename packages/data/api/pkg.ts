const { validate } = require("../utils.js");
const KDATA = require("./kdata_per_author_id.json");

/** @type {import('@vercel/node').VercelRequest} */
let req;
/** @type {import('@vercel/node').VercelResponse} */
let res;

module.exports = async function handler(reqParam: any, resParam: any) {
    req = reqParam;
    res = resParam;

    try {
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

            if (req.method === "OPTIONS") {
                res.statusCode = 200;
                res.end();
                return;
            }
        }

        if (req.method !== "GET") {
            res.status(405).send("Only GET allowed");
            return;
        }

        const { id } = req.query;

        if (!validate(id))
            return res.status(400).json({ error: "Bad request: No package ID specified." });
        // !@ts-expect-error
        if (!KDATA[id])
            return res
                .status(404)
                .json({ error: `Not found: Package '${id}' was not found within the registry.` });

        // !@ts-expect-error
        res.status(200).json(KDATA[id]);
        return;
    } catch (error) {
        res.status(500).json({ message: "Internal error: " + String(error) });
        return;
    }
};
