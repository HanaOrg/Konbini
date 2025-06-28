import { validate } from "@zakahacecosas/string-utils";
import { bearer } from "../../gui/src/tkn";

// whether we're on web or not, because the CLI cannot use the web cache API
const isWeb = typeof window !== "undefined" && typeof document !== "undefined";

// TODO - implement hand-made caching for CLI
const cacheAPI = isWeb
    ? caches
    : {
          open: async (_: string) => ({
              match: async () => undefined,
              put: async () => undefined,
          }),
      };

function isNotTooOld(match: Response): boolean {
    // lol
    if (!isWeb) return false;

    const cacheDate = new Date(match.headers.get("x-cache-date") || Date.now());
    const now = new Date();

    const expired = now.getTime() - cacheDate.getTime() > 21 * 24 * 60 * 60 * 1000; // 21 days, or 3 weeks

    if (expired) return false;

    return true;
}

/** Safely fetch an API, handling rate limits and caching. */
export async function fetchAPI(_url: string, method?: "GET"): Promise<Response> {
    // somewhere, idk where, manifests are fetched with a "//" in middle of the URL
    // duplicating requests and cache, as /package/* does fetch without the "//"
    const url = _url.replaceAll("//", "/").replace("https:/", "https://");

    // whether to use github API token or not
    const useBearer = validate(bearer) && url.startsWith("https://api.github");

    const cache = await cacheAPI.open("kbi-cache");
    const match = await cache.match(url);
    if (match && isNotTooOld(match)) return match;

    const res = await fetch(url, {
        headers: useBearer
            ? {
                  Authorization: bearer!,
              }
            : undefined,
        method: method ?? undefined,
    });

    // two clones because putting the res inside of the cache also counts as using it
    // disallowing us from .json() or .text() it after calling this function
    const clone = res.clone();
    const clone2 = res.clone();
    const json = await clone.json().catch((e) => {
        if (String(e).includes("Failed to parse JSON")) return {};
        throw e;
    });

    const IRL = json.message && json.message.includes("rate limit exceeded");

    if (IRL) {
        throw "API rate limit exceeded. Konbini has a slightly strict per-user API limit.\n      This error occurs if you use the CLI too much in a short period of time.\n      ('Use it' in the sense of downloading packages; internet-less operations like 'list' do not cause this).\n      Please try again later (in an hour or so).";
    }

    const headersWithCache = new Headers(clone2.headers);
    headersWithCache.set("x-cache-date", new Date().toISOString());

    const timestampedCacheEntry = new Response(await clone2.blob(), {
        status: clone2.status,
        statusText: clone2.statusText,
        headers: headersWithCache,
    });

    await cache.put(url, timestampedCacheEntry);
    return res;
}
