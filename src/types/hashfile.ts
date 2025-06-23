/**
 * A Konbini hashfile. MUST be present on a project's GitHub release for it to be downloadable.
 *
 * @export
 * @interface KONBINI_HASH_FILE
 */
export interface KONBINI_HASH_FILE {
    /**
     * 64-bits Linux executable hash.
     *
     * @type {?string}
     */
    linux_64_sha?: string;
    /**
     * ARM Linux executable hash.
     *
     * @type {?string}
     */
    linux_arm_sha?: string;
    /**
     * 64-bits (INTEL) macOS executable hash.
     *
     * @type {?string}
     */
    mac_64_sha?: string;
    /**
     * ARM (SILICON) macOS executable hash.
     *
     * @type {?string}
     */
    mac_arm_sha?: string;
    /**
     * 64-bits Microsoft Windows executable hash.
     *
     * @type {?string}
     */
    win64_sha?: string;
}
