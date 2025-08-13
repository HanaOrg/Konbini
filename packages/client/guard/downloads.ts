import { Redis } from "@upstash/redis";
import type { KONBINI_ID_PKG } from "shared/types/author";
import type { SUPPORTED_PLATFORMS } from "shared/types/manifest";

interface DownloadData {
    app: KONBINI_ID_PKG;
    version: string;
    sys: SUPPORTED_PLATFORMS;
    country: string;
    timestamp: number;
}

export async function getDownloads(app: KONBINI_ID_PKG): Promise<{
    installs: DownloadData[];
    removals: DownloadData[];
    active: number;
}> {
    const url = process.env["UPSTASH_REDIS_REST_URL"];
    const token = process.env["UPSTASH_REDIS_REST_TOKEN"];

    if (!url || !token) {
        throw new Error("Missing UPSTASH env variables! Cannot operate.");
    }

    const db = new Redis({
        url,
        token,
    });

    const installs = (await db.lrange("downloads", 0, -1))
        .filter((i) => (i as any).app == app)
        .map((s) => JSON.parse(s));
    const removals = (await db.lrange("removals", 0, -1))
        .filter((i) => (i as any).app == app)
        .map((s) => JSON.parse(s));
    const active = installs.length - removals.length;

    return {
        installs,
        removals,
        active,
    };
}
