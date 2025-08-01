import { getPlatform } from "./platform";

export async function logAction(params: {
    app: string;
    version: string;
    action: "download" | "remove";
}) {
    return await fetch("https://konbini-data.vercel.app/api/main", {
        method: "POST",
        body: JSON.stringify({
            app: params.app,
            version: params.version,
            action: params.action,
            sys: getPlatform(),
        }),
    });
}
