import { validateAgainst } from "@zakahacecosas/string-utils";

/** An individual. */
interface PERSON {
    /** Name of the person. Should be real, but doesn't have to, a username works. */
    name: string;
    /** If true, it means this user has been verified by the Konbini team.
     * Users shall not include this in their initial Pull Request.
     */
    verified?: boolean;
    /** Organization they belong to. It can be either a string (its name) or an organization identifier (org.foobar) - in which case it'll become a clickable link in the UI. */
    org?: string;
    /** Their email. */
    email?: string;
    /** Their personal website. */
    website?: string;
    /** Their biography - a text they can write inside of their profiles. */
    biography?: string;
    /** Whether they're for hire or not. Defaults to not. */
    for_hire?: boolean;
    /** Their socials. */
    socials: {
        /** Their Twitter handle, _without_ the `@` symbol. */
        twitter?: string;
        /** Their GitHub username. */
        github?: string;
    };
}

/** An organization. */
interface ORGANIZATION {
    /** Organization's name. */
    name: string;
    /** If true, it means this organization has been verified by the Konbini team.
     * Organization owners shall not include this in their initial Pull Request.
     */
    verified?: boolean;
    /** Organization's website. Required for transparency and verification purposes. */
    website: string;
    /** Organization's email. Required for transparency and verification purposes. */
    email: string;
    /** Whether it's a private, non profit, public, or collab organization. Required for transparency purposes.
     * For other types of organizations, use `OTHER`, as some organizations are hard to catalog.
     */
    type: "PRIVATE_CORP" | "NON_PROFIT" | "GOVT_ORG" | "COLLAB_ORG" | "OTHER";
    /** Their biography - a text they can write inside of their profiles. */
    biography?: string;
    /** Whether they're hiring people or not. Defaults to not. */
    hiring?: boolean;
    /** Organization's socials, if any. */
    socials: {
        /** Their Twitter handle, _without_ the `@` symbol. */
        twitter?: string;
        /** Their GitHub username. */
        github?: string;
    };
}

/** A package's author.
 * @type {PERSON | ORGANIZATION}
 */
export type AUTHOR = PERSON | ORGANIZATION;

/** A package author's unique identifier. Works like a username.
 *
 * The prefix is `org.` for organizations and `usr.` for persons.
 */
export type AUTHOR_ID = `${"org" | "usr"}.${string}`;

/** If true, given author is an `ORGANIZATION`, else it is a `PERSON`. */
export function isOrganization(author: AUTHOR): author is ORGANIZATION {
    return validateAgainst((author as ORGANIZATION).type, [
        "PRIVATE_CORP",
        "NON_PROFIT",
        "GOVT_ORG",
        "COLLAB_ORG",
        "OTHER",
    ]);
}
