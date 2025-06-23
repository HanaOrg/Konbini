import { existsSync, writeFileSync, rmSync } from "fs";
import { konsole } from "./konsole";

export async function downloadHandler(params: { remoteUrl: string; filePath: string }) {
    const { remoteUrl, filePath } = params;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000); // 4 mins (240000ms)

    try {
        const res = await fetch(remoteUrl, {
            signal: controller.signal,
            redirect: "follow",
            method: "GET",
        });

        if (!res.ok) throw `HTTP error: ${res.status}`;
        if (!res.body) throw `Missing HTTP response body.`;

        if (existsSync(filePath)) rmSync(filePath);

        writeFileSync(filePath, new Uint8Array(await res.arrayBuffer()));
    } catch (e) {
        if (Error.isError(e) && e.name === "AbortError") {
            konsole.war("Download took too long to complete (timeout: 4 minutes).");
            // easter egg
            if (Math.random() < 0.3) konsole.war("hope no one's DDoS-ing us");
            process.exit(1);
        }
        throw e;
    } finally {
        clearTimeout(timeoutId);
    }
}
