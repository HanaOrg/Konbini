import { existsSync, rmSync, writeFileSync } from "node:fs";

export async function downloadHandler(params: {
    remoteUrl: string;
    filePath: string;
}): Promise<"Success" | "TimeOut"> {
    const { remoteUrl, filePath } = params;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000); // 4 mins (240000ms)

    try {
        const res = await fetch(remoteUrl, {
            signal: controller.signal,
            redirect: "follow",
            method: "GET",
        });

        if (!res.ok) {
            throw `HTTP error: ${res.status}`;
        }
        if (!res.body) {
            throw `Missing HTTP response body.`;
        }

        if (existsSync(filePath)) {
            rmSync(filePath);
        }

        writeFileSync(filePath, new Uint8Array(await res.arrayBuffer()));
    } catch (e) {
        if (Error.isError(e) && e.name === "AbortError") {
            return "TimeOut";
        }
        throw e;
    } finally {
        clearTimeout(timeoutId);
    }

    return "Success";
}
