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

    return await fetch("https://konbini-data.vercel.app/api/download", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(cnt),
    });
}
