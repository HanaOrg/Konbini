import { getPlatform } from "./platform";
import { normalize } from "@zakahacecosas/string-utils";
import type { KONBINI_ID_PKG, KONBINI_ID_USR } from "../types/author";
import { fetchAPI } from "./network";
import type { KDATA_ENTRY_PKG, KDATA_FILE_PKG, KDATA_ENTRY_USR } from "../types/kdata";

export async function getPkg(pkg: KONBINI_ID_PKG): Promise<KDATA_ENTRY_PKG> {
    const res = await fetchAPI(`https://konbini-data.vercel.app/api/pkg?id=${pkg}`);
    const json = await res.json();

    return json;
}

export async function getPkgs(sorting: "d" | "r", entries?: number): Promise<KDATA_FILE_PKG> {
    const res = await fetchAPI(
        `https://konbini-data.vercel.app/api/sorted?sorting=${sorting}${entries ? `&entries${entries}` : ""}`,
    );
    const json = await res.json();

    return json;
}

export async function getAuthor(usr: KONBINI_ID_USR): Promise<KDATA_ENTRY_USR> {
    const res = await fetchAPI(`https://konbini-data.vercel.app/api/author?id=${usr}`);
    const json = await res.json();

    return json as KDATA_ENTRY_USR;
}

export async function searchPkg(q: string): Promise<KDATA_ENTRY_PKG[]> {
    const res = await fetchAPI("https://konbini-data.vercel.app/api/group?sorting=d");
    const json: KDATA_FILE_PKG = await res.json();

    const results: KDATA_ENTRY_PKG[] = [];
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

export async function logAction(params: {
    app: string;
    version: string;
    action: "download" | "remove";
}): Promise<Response> {
    return await fetch("https://konbini-data.vercel.app/api/download", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...params,
            sys: getPlatform(),
        }),
    });
}
