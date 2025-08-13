/** GitHub / CodeBerg REST API Release
 *
 * They use the same response format (at least for the properties we use), thus a single interface.
 */
export interface RELEASE_GH_CB {
    /** Used for package version; this will be stored inside of the package's lockfile. */
    tag_name: string;
    /** When was this release published. */
    published_at: string;
    /** Downloadable assets we want. */
    assets: {
        /** Filename of the asset. */
        name: string;
        /** URL to the asset. May be a binary, `.asc` file, or `.yaml` file. */
        browser_download_url: string;
    }[];
}

/** GitLab REST API Release */
export interface RELEASE_GL {
    /** Used for package version; this will be stored inside of the package's lockfile. */
    tag_name: string;
    /** When was this release published. */
    published_at: string;
    /** Downloadable assets we want. */
    assets: {
        /** Actual downloadable assets we want. */
        links: {
            /** Filename of the asset. */
            name: string;
            /** URL to the asset. May be a binary, `.asc` file, or `.yaml` file. */
            url: string;
        }[];
    };
}
