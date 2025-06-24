import { validate } from "@zakahacecosas/string-utils";
import { bearer } from "../../gui/src/tkn";

/** Safely fetch an API, GitHub's one most of the time. */
export async function fetchAPI(url: string, method?: "GET"): Promise<Response> {
    const useBearer = validate(bearer) && url.startsWith("https://api.");

    const res = await fetch(url, {
        headers: useBearer
            ? {
                  Authorization: bearer,
              }
            : undefined,
        method: method ?? undefined,
    });

    const json = await res.clone().json();

    const IRL = json.message && json.message.includes("rate limit exceeded");

    if (IRL) {
        throw new Error(
            "API rate limit exceeded. Konbini has a slightly strict per-user API limit.\n      This error occurs if you use the CLI too much in a short period of time.\n      ('Use it' in the sense of downloading packages; internet-less operations like 'list' do not cause this).\n      Please try again later (in an hour or so).",
        );
    }

    return res;
}
