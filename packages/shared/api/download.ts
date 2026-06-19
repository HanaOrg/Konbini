import { validate } from "@zhc.js/string-utils";
import { existsSync, rmSync, writeFileSync } from "node:fs";

export async function downloadHandler(params: {
    remoteUrl: string;
    filePath: string;
}): Promise<"Success" | "TimeOut"> {
    const { remoteUrl, filePath } = params;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240_000); // 4 mins (240000ms)

    try {
        const res = await fetch(remoteUrl, {
            signal: controller.signal,
            redirect: "follow",
            method: "GET",
            headers: validate(import.meta.env["BEARER"])
                ? {
                      Authorization: import.meta.env["BEARER"],
                  }
                : undefined,
        });

        if (!res.ok) throw `HTTP ${res.status} error fetching remote for download ${filePath}.`;
        if (!res.body) throw `Missing HTTP response body fetching remote for download ${filePath}.`;
        if (existsSync(filePath)) rmSync(filePath);

        writeFileSync(filePath, new Uint8Array(await res.arrayBuffer()));
    } catch (error) {
        if (Error.isError(error) && error.name === "AbortError") {
            return "TimeOut";
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }

    return "Success";
}
