const { validate, isValidOrigin } = require("../utils.js");
const KDATA = require("./guard_res.json");

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

        const { id } = req.query;

        if (!validate(id))
            return res.status(400).json({ error: "Bad request: No package ID specified." });
        if (!KDATA.results[id])
            return res
                .status(404)
                .json({ error: `Not found: Package '${id}' was not found within the registry.` });

        res.status(200).json({
            date: KDATA.date,
            results: KDATA.results[id],
        });
        return;
    } catch (error) {
        res.status(500).json({ message: "Internal error: " + String(error) });
        return;
    }
};
