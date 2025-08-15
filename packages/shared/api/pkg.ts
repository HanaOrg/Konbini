import { normalize } from "@zakahacecosas/string-utils";
import type { KDATA_ENTRY, KDATA_FILE } from "../../client/guard/guard";
import type { KONBINI_AUTHOR, KONBINI_ID_PKG, KONBINI_ID_USR } from "../types/author";
import { fetchAPI } from "./network";

export async function getPkg(pkg: KONBINI_ID_PKG): Promise<KDATA_ENTRY> {
    const res = await fetchAPI(`https://konbini-data.vercel.app/api/pkg?id=${pkg}`);
    const json = await res.json();

    return json as KDATA_ENTRY;
}

export async function getAuthor(
    usr: KONBINI_ID_USR,
): Promise<KONBINI_AUTHOR & { id: KONBINI_ID_USR }> {
    const res = await fetchAPI(`https://konbini-data.vercel.app/api/author?id=${usr}`);
    const json = await res.json();

    return json as KONBINI_AUTHOR & { id: KONBINI_ID_USR };
}

export async function searchPkg(q: string): Promise<KDATA_ENTRY[]> {
    const res = await fetchAPI("https://konbini-data.vercel.app/api/group?sorting=d");
    const json: KDATA_FILE = await res.json();

    const results: KDATA_ENTRY[] = [];
    const query = normalize(q);
    const matches = (s: string) => normalize(s, { strict: true }).includes(query);

    Object.entries(json).forEach(([_, app]) => {
        if (
            matches(app.name) ||
            matches(app.desc) ||
            matches(app.slogan) ||
            app.categories.some(matches)
        )
            results.push(app);
    });

    return results;
}
