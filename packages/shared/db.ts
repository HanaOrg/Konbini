// TODO - RLS ain't working
import { createClient } from "@supabase/supabase-js";
import { getPlatform } from "./api/platform";
import { USR_PRV_HASH } from "./constants";

interface DOWNLOAD_LOG_ENTRY {
    /** APP ID */
    app_id: string;
    /** ACTION TO LOG */
    action: "dwn" | "rem";
    /** TIMESTAMP (type: `timestampz`) */
    ts: string;
    /** PLATFORM */
    plat: "win" | "lin64" | "linARM" | "mac64" | "macARM";
    /** UNIQUE, but untrackable, USER HASH */
    usr_hash: string;
}

const supabase = createClient(
    "https://btvpjiafoizomfsfwzep.supabase.co",
    process.env["SUPABASE_TOKEN"]!,
);

export async function LOG_ACTION(params: { app_id: string; action: "dwn" | "rem" }): Promise<void> {
    const { app_id, action } = params;
    const p = getPlatform();

    const input: DOWNLOAD_LOG_ENTRY = {
        app_id,
        action,
        // timestamp?
        ts: new Date().toISOString(),
        plat:
            p === "win64"
                ? "win"
                : p === "linux64"
                  ? "lin64"
                  : p === "linuxArm"
                    ? "linARM"
                    : p === "mac64"
                      ? "mac64"
                      : "macARM",
        usr_hash: (await USR_PRV_HASH())!,
    };

    console.debug(input);
    const res = await supabase.from("kbi_downloads").insert(input);

    console.debug(res.data, res.statusText, res.count);
    if (res.error) throw res.error;
    return;
}
