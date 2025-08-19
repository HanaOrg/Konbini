import { konsole } from "shared/client";
import { Unpack } from "./src/unpack";
import { readFileSync, statSync } from "fs";

/** ## Konpak self-extractor.
 * This file only (well, and the modules it imports) are the entire KPAK SFX module. It works like any self extracting archive, it reads itself searching for an indicator (`KPAK__SIGNALER`), takes all the data after it, and extracts it using the code before it
 */
function main() {
    const self = readFileSync(process.execPath);
    const kpakIndex = self.lastIndexOf(Buffer.from("KPAK__SIGNALER"));
    if (kpakIndex === -1) throw new Error("No signaler header found.");

    konsole.dbg("DEBUG INFO ---");
    konsole.dbg("KPAK-SFX at", process.execPath);
    konsole.dbg("konpak size", statSync(process.execPath).size);
    konsole.dbg("1st 16bytes", self.subarray(0, 16).toString("hex"));
    konsole.dbg("signaler at", kpakIndex);

    const kpak = self.subarray(kpakIndex);
    Unpack(kpak);
}

main();
