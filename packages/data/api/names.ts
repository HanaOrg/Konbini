const { isValidOrigin } = require("../utils.js");
const KDATA = require("./kdata_names.json");

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

        res.status(200).json(KDATA);
        return;
    } catch (error) {
        res.status(500).json({ message: "Internal error: " + String(error) });
        return;
    }
};
