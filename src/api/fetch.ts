import { konsole } from "../toolkit/konsole";

export async function fetchAPI(url: string, method?: "GET"): Promise<Response> {
    const res = await fetch(url, {
        method: method ?? undefined,
    });

    try {
        const clone = res.clone();
        const json = await clone.json();

        const IRL = (json as any).message && (json as any).message.includes("rate limit");

        if (IRL) {
            konsole.err(
                "API rate limit exceeded. Konbini has a slightly strict per-user API limit.\n      This error occurs if you use the CLI too much in a short period of time.\n      ('Use it' in the sense of downloading packages; internet-less operations like 'list' do not cause this).\n      Please try again later (in an hour or so).",
            );
            process.exit(1);
        }
    } catch {}

    return res;
}
