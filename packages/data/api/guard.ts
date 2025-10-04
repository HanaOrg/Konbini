const { validate, validateAgainst, isValidOrigin } = require("../utils.js");
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
        const [pkgName, pkgVer, pkgPlatform] = id.split("@");
        if (!validate(pkgName))
            return res
                .status(400)
                .json({ error: "Bad request: No proper package ID specified?. Got " + pkgName });
        if (!validate(pkgVer))
            return res.status(400).json({ error: "Bad request: No package version specified." });
        if (isNaN(pkgVer))
            return res.status(400).json({ error: "Bad request: Invalid package version." });
        if (!validateAgainst(pkgPlatform, ["linux64", "linuxArm", "mac64", "macArm", "win64", "0"]))
            return res.status(400).json({
                error: "Bad request: No proper package platform specified. Specify a SUPPORTED_PLATFORM, or a '0' for a global check.",
            });

        if (pkgPlatform === "0") {
            return res
                .status(200)
                .json(
                    Object.fromEntries(
                        Object.entries(KDATA.results).filter(([k]) => k.startsWith(pkgName)),
                    ),
                );
        }

        if (!KDATA.results[`${pkgName}@${pkgPlatform}`])
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
