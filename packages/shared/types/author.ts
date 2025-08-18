import { validate, validateAgainst } from "@zakahacecosas/string-utils";

/** Properties common to persons and organizations. */
interface COMMON_PROFILE {
    /** Name of the person or organization.
     *
     * For persons it should be real, but doesn't have to, a username or pseudonym works.
     *
     * For organizations it HAS TO be real.
     */
    name: string;
    /** If true, it means this user has been verified by the Konbini team.
     * Users / organization owners may include this in their initial Pull Request only if the requirements are met.
     */
    verified?: boolean;
    /** Their website. */
    website?: string;
    /** Their contact email address. */
    email?: string;
    /** Their biography - a text they can write inside of their profiles. */
    biography?: string;
    /** Their socials, if any. */
    socials?: {
        /** Their Twitter handle, _without_ the `@` symbol. */
        twitter?: string;
        /** Their Bluesky handle, _without_ the `@` symbol. */
        bluesky?: string;
        /** Their Instagram handle, _without_ the `@` symbol. */
        instagram?: string;
        /** Their GitHub username. */
        github?: string;
        /** Their GitLab username. */
        gitlab?: string;
        /** Their GitLab username. */
        codeberg?: string;
    };
}

/** An individual. */
interface PERSON extends COMMON_PROFILE {
    /** Organization they belong to. It can be either a string (its name) or an organization identifier (org.foobar) - in which case it'll become a clickable link in the UI. */
    org?: string;
    /** Whether they're for hire or not. Defaults to not. */
    for_hire?: boolean;
}

/** An organization. */
interface ORGANIZATION extends COMMON_PROFILE {
    /** Whether it's a private, non profit, public, or collab organization. Required for transparency purposes.
     * For other types of organizations, use `OTHER`, as some organizations are hard to catalog.
     */
    type: "PRIVATE_CORP" | "NON_PROFIT" | "GOVT_ORG" | "COLLAB_ORG" | "OTHER";
    /** Whether they're hiring people or not. Defaults to not. */
    hiring?: boolean;
}

/** A package's author.
 * @type {PERSON | ORGANIZATION}
 */
export type KONBINI_AUTHOR = PERSON | ORGANIZATION;

/** A package author's unique identifier. Works like a username.
 *
 * The prefix is `org.` for organizations and `usr.` for persons.
 */
export type KONBINI_ID_USR = `${"org" | "usr"}.${string}`;

export type KONBINI_ID_PKG = `${KONBINI_ID_USR}.${string}`;

/** Validates the given Konbini author ID. */
export function isAuthorId(id: any): id is KONBINI_ID_USR {
    return (
        validate(id) &&
        (id.startsWith("org.") || id.startsWith("usr.")) &&
        validate(id.split(".")[1])
    );
}

/** If true, given author is an `ORGANIZATION`, else it is a `PERSON`. */
export function isOrganization(author: KONBINI_AUTHOR): author is ORGANIZATION {
    return validateAgainst((author as ORGANIZATION).type, [
        "PRIVATE_CORP",
        "NON_PROFIT",
        "GOVT_ORG",
        "COLLAB_ORG",
        "OTHER",
    ]);
}
