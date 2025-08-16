const { validate, isValidOrigin } = require("../utils.js");
const KDATA_PER_AUTHOR_ID = require("./kdata_per_author_id.json");
const KDATA_PER_DOWNLOADS = require("./kdata_per_downloads.json");
const KDATA_PER_RELEASES = require("./kdata_per_releases.json");
const KDATA_PER_CATEGORY = require("./kdata_per_category.json");

/** @type {import('@vercel/node').VercelRequest} */
let req;
/** @type {import('@vercel/node').VercelResponse} */
let res;

module.exports = async function handler(reqParam: any, resParam: any) {
    req = reqParam;
    res = resParam;

    try {
        if (isValidOrigin(req, res) && req.method === "OPTIONS") {
            res.statusCode = 200;
            res.end();
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

        const num = isNaN(Number(entries)) ? undefined : Number(entries);
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
};
