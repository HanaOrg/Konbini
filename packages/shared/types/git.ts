/** GitHub REST API Release */
export interface RELEASE_GITHUB {
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

/** GitLab REST API Release */
export interface RELEASE_GITLAB {
    /** Used for package version; this will be stored inside of the package's lockfile. */
    tag_name: string;
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

/** GitLab REST API Release */
export interface RELEASE_CODEBERG {
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
