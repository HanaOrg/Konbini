import { isOrganization, type KONBINI_AUTHOR } from "shared/types/author";
import Badge from "../badge";
import { toUpperCaseFirst } from "@zakahacecosas/string-utils";

export default function PublisherDetails({ usr }: { usr: KONBINI_AUTHOR }) {
    if (isOrganization(usr)) {
        const orgStr =
            usr.type === "PRIVATE_CORP"
                ? "Private corporation"
                : usr.type === "GOVT_ORG"
                  ? "Public/government organization"
                  : usr.type === "NON_PROFIT"
                    ? "Non-profit organization"
                    : usr.type === "COLLAB_ORG"
                      ? "Collab organization"
                      : "Organization";

        return (
            <>
                <h2 className="mt-12  text-3xl text-white font-semibold">Publisher details</h2>
                <p>This is an organization.</p>
                <div className="flex flex-row gap-1 mt-2 mb-1">
                    <Badge color="#ffffff3a" text={usr.name} />

                    {usr.verified && (
                        <Badge text="This organization got verified" color="#c232826a" />
                    )}
                </div>
                <div className="flex flex-row gap-1 mb-2">
                    {usr.email && <Badge color="#ffffff0f" text={usr.email} link="mailto:" />}
                    {usr.website && <Badge color="#ffffff0f" text={usr.website} link="https://" />}
                    <Badge color="#ffffff1a" text={orgStr} />
                    {usr.hiring ? (
                        <Badge color="#30ff801a" text="Currently hiring" />
                    ) : (
                        <Badge color="#ffc8301a" text="Not currently hiring" />
                    )}
                </div>
                <p>About {usr.name}:</p>
                <p className="text-xl text-white">
                    {usr.biography ? usr.biography : <i>No biography provided.</i>}
                </p>
                {usr.socials && (
                    <>
                        <p>Follow them</p>
                        <div className="flex flex-col gap-1 mt-2 mb-1">
                            {Object.entries(usr.socials!).map((e) => (
                                <a
                                    href={`https://${e[0]}.com/${e[1]}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {toUpperCaseFirst(e[0])} @{e[1]}
                                </a>
                            ))}
                        </div>
                    </>
                )}
            </>
        );
    }

    return (
        <>
            <h2 className="mt-12  text-3xl text-white font-semibold">Publisher details</h2>
            <p>This is a regular user.</p>
            <div className="flex flex-row gap-1 mt-2 mb-1">
                <Badge color="#ffffff3a" text={usr.name} />
                {usr.verified && <Badge text="This user got verified" color="#c232826a" />}
            </div>
            <div className="flex flex-row gap-1 mb-2">
                {usr.email && <Badge color="#ffffff0f" text={usr.email} link="mailto:" />}
                {usr.website && <Badge color="#ffffff0f" text={usr.website} link="https://" />}
                {/* TODO: make the link clickable if the org is a Konbini one */}
                {usr.org && <Badge color="#ffffff1a" text={`Working at ${usr.org}`} />}
                {usr.for_hire ? (
                    <Badge color="#30ff801a" text="Currently for hire" />
                ) : (
                    <Badge color="#ffc8301a" text="Not currently for hire" />
                )}
            </div>
            <p>About {usr.name}:</p>
            <p className="text-xl text-white">
                {usr.biography ? usr.biography : <i>No biography provided.</i>}
            </p>
            {usr.socials && (
                <>
                    <p>Follow them</p>
                    <div className="flex flex-col gap-1 mt-2 mb-1">
                        {Object.entries(usr.socials!).map((e) => (
                            <a
                                href={`https://${e[0]}.com/${e[1]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {toUpperCaseFirst(e[0])} @{e[1]}
                            </a>
                        ))}
                    </div>
                </>
            )}
        </>
    );
}
