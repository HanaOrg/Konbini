import { fetchAPI } from "./network";
import { getPlatform } from "./platform";

export async function logAction(params: {
    app: string;
    version: string;
    action: "download" | "remove";
}): Promise<Response> {
    const cnt = {
        app: params.app,
        version: params.version,
        action: params.action,
        sys: getPlatform(),
    };

    return await fetch("https://konbini-data.vercel.app/api/write", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(cnt),
    });
}

export async function getDownloads(
    app: string,
): Promise<{ downloads: number; removals: number; product: number }> {
    return await (
        await fetchAPI(`https://konbini-data.vercel.app/api/read?app=${app}`, "GET")
    ).json();
}
