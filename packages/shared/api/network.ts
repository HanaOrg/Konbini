import { validate } from "@zakahacecosas/string-utils";

/*
no bearer exists in production; every user has his own per-IP rate limit anyway
API key is only used locally as KGuard is expensive and needs higher limits
*/
const bearer = import.meta.env["BEARER"];

// whether we're on web or not, because the CLI cannot use the web cache API
const isWeb = typeof window !== "undefined" && typeof document !== "undefined";

const cacheAPI = isWeb
    ? caches
    : {
          open: async (_: string) => ({
              match: async () => undefined,
              put: async () => undefined,
          }),
      };

/** 48 hours. */
const CACHE_DURATION_MS = 48 * 60 * 60 * 1000;

function isNotTooOld(match: Response): boolean {
    // lol
    if (!isWeb) return false;

    const header = match.headers.get("x-cache-date");
    if (!header) return false;

    const cacheDate = new Date(header);
    if (Number.isNaN(cacheDate.getTime())) return false;

    return Date.now() - cacheDate.getTime() <= CACHE_DURATION_MS;
}

/** Safely fetch an API, handling rate limits and caching. */
export async function fetchAPI(_url: string, method: "GET" | "POST" = "GET"): Promise<Response> {
    // somewhere, idk where, manifests are fetched with a "//" in middle of the URL
    // duplicating requests and cache, as /package/* does fetch without the "//"
    const url = _url.replaceAll("//", "/").replace("https:/", "https://").replace("?ref=main", "");

    const cache = await cacheAPI.open("kbi-cache");
    const match = await cache.match(url);
    if (match && isNotTooOld(match)) return match;

    const res = await fetch(url, {
        headers:
            validate(bearer) && url.startsWith("https://api.github")
                ? {
                      Authorization: bearer,
                  }
                : undefined,
        method,
    });

    // two clones because putting the res inside of the cache also counts as using it
    // disallowing us from .json() or .text() it after calling this function
    const clone = res.clone();
    const clone2 = res.clone();
    const json = await clone.json().catch((e) => {
        const err = String(e);
        if (
            err.includes("Failed to parse JSON") ||
            err.includes("is not valid JSON") ||
            err.includes("JSON Parse error")
        )
            return {};
        throw e;
    });

    const IRL = json.message && json.message.includes("rate limit exceeded");

    if (IRL) {
        throw "API rate limit exceeded. Konbini has a slightly strict per-user API limit.\nThis error occurs if you use the CLI too much in a short period of time.\n('Use it' in the sense of downloading packages; internet-less operations like 'list' do not cause this).\nPlease try again later (in an hour at most, possibly less).";
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
