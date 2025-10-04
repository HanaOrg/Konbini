import type { KONBINI_ID_PKG, KONBINI_AUTHOR, KONBINI_ID_USR } from "./author";
import type { SUPPORTED_PLATFORMS, KONBINI_MANIFEST } from "./manifest";

interface DownloadEntry {
    app: KONBINI_ID_PKG;
    version: string;
    sys: SUPPORTED_PLATFORMS;
    country: string;
    timestamp: number;
}
export interface DownloadData {
    installs: DownloadEntry[];
    removals: DownloadEntry[];
    active: number;
}
export type MANIFEST_WITH_ID = KONBINI_MANIFEST & {
    /** The package's ID. */
    id: KONBINI_ID_PKG;
    /** Download URL. */
    url: string;
};
export type KDATA_ENTRY_PKG = KONBINI_MANIFEST & {
    /** Download data. */
    downloads: DownloadData;
    /** Date of the last release. */
    last_release_at: string;
    /** Tag name of the latest release. */
    latest_release: string;
    /** Markdown string of the last changelog entry. */
    changelog: string;
    /** Filesizes of all uploaded binaries, in bytes. Platforms without a binary are entirely absent.*/
    filesizes: Record<SUPPORTED_PLATFORMS, number>;
    /** The package's ID. */
    id: KONBINI_ID_PKG;
};
export type KDATA_ENTRY_USR = KONBINI_AUTHOR & { id: KONBINI_ID_USR; packages: KDATA_FILE_PKG };
export type KDATA_FILE_PKG = Record<KONBINI_ID_PKG, KDATA_ENTRY_PKG>;
export type KDATA_FILE_USR = Record<KONBINI_ID_USR, KDATA_ENTRY_USR>;
