/** GitHub Rest API Release */
export interface GRA_RELEASE {
    /** Used for package version; this will be stored inside of the package's lockfile. */
    tag_name: string;
    /** Downloadable assets we want. */
    assets: {
        /** Filename of the asset. */
        name: string;
        /** URL to the asset. May be a binary, `.asc` file, or `.yaml` file. */
        browser_download_url: string;
    }[];
}
