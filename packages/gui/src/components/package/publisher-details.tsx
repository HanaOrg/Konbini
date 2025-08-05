import { isOrganization, type KONBINI_AUTHOR, type KONBINI_AUTHOR_ID } from "shared/types/author";
import Badge from "../badge";
import { toUpperCaseFirst } from "@zakahacecosas/string-utils";
import type { MANIFEST_WITH_ID } from "../../routes/home";
import Detail from "../detail";
import { locateUsr } from "shared/api/core";

export default function PublisherDetails({
    authorId,
    usr,
    apps,
}: {
    authorId: KONBINI_AUTHOR_ID;
    usr: KONBINI_AUTHOR;
    apps: null | MANIFEST_WITH_ID[];
}) {
    const manifestUrl =
        locateUsr(authorId)
            .replace("raw.githubusercontent", "github")
            .replace("main", "blob/main") +
        "/" +
        authorId.split(".")[1] +
        ".yaml";

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
                <p>
                    This is an organization.
                    {apps !== null ? (
                        ""
                    ) : (
                        <>
                            {" "}
                            See other apps from them{" "}
                            <a href={`https://konbini.vercel.app/author/${authorId}`}>here</a>.
                        </>
                    )}
                </p>
                <div className="flex flex-row gap-1 mt-2 mb-1">
                    <Badge color="#ffffff3a">{usr.name}</Badge>

                    {usr.verified && (
                        <Badge color="#c232826a">This organization got verified</Badge>
                    )}
                </div>
                <div className="flex flex-row gap-1 mb-2">
                    {usr.email && (
                        <Badge color="#ffffff0f">
                            <a href={`mailto:${usr.email}`}>{usr.email}</a>
                        </Badge>
                    )}
                    {usr.website && (
                        <Badge color="#ffffff0f">
                            <a href={`https://:${usr.website}`}>{usr.website}</a>
                        </Badge>
                    )}
                    <Badge color="#ffffff1a">{orgStr}</Badge>
                    {usr.hiring ? (
                        <Badge color="#30ff801a">Currently hiring</Badge>
                    ) : (
                        <Badge color="#ffc8301a">Not currently hiring</Badge>
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
                {apps && (
                    <>
                        <h2 className="mt-12  text-3xl text-white font-semibold">
                            All apps from {usr.name}
                        </h2>
                        {apps.map((app) => (
                            <>
                                <div className="p-4 rounded-xl mt-2 bg-[#ffffff20]">
                                    <h3 className="text-xl text-white font-medium">{app.name}</h3>
                                    <a href={`https://konbini.vercel.app/package/${app.id}`}>
                                        See in Konbini
                                    </a>
                                </div>
                            </>
                        ))}
                        <h2 className="mt-12  text-3xl text-white font-semibold">Transparency</h2>
                        <Detail>
                            <svg
                                width="35"
                                height="35"
                                fill="none"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M12 2v6a2 2 0 0 0 2 2h6v10a2 2 0 0 1-2 2h-6.81A6.5 6.5 0 0 0 4 11.498V4a2 2 0 0 1 2-2h6Zm1.5.5V8a.5.5 0 0 0 .5.5h5.5l-6-6ZM6.5 23a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11Zm-1.146-7.646a.5.5 0 0 0-.708-.708l-2.5 2.5a.5.5 0 0 0 0 .708l2.5 2.5a.5.5 0 0 0 .708-.708L3.207 17.5l2.147-2.146Zm2.292-.708a.5.5 0 0 0 0 .708L9.793 17.5l-2.147 2.146a.5.5 0 0 0 .708.708l2.5-2.5a.5.5 0 0 0 0-.708l-2.5-2.5a.5.5 0 0 0-.708 0Z"
                                    fill="#ffffff"
                                />
                            </svg>
                            <div className="flex flex-col">
                                <a href={manifestUrl} target="_blank" rel="noopener noreferrer">
                                    Author manifest
                                </a>
                                <p className="text-xs font-light">
                                    {manifestUrl
                                        .replace("https://github.com/HanaOrg/", "")
                                        .replace(
                                            `blob/main/${authorId.split(".")[0]}/${authorId.slice(0, 2)}`,
                                            "",
                                        )}
                                </p>
                            </div>
                        </Detail>
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
                <Badge color="#ffffff3a">{usr.name}</Badge>
                {usr.verified && <Badge color="#c232826a">This user got verified</Badge>}
            </div>
            <div className="flex flex-row gap-1 mb-2">
                {usr.email && (
                    <Badge color="#ffffff0f">
                        <a href={`mailto:${usr.email}`}>{usr.email}</a>
                    </Badge>
                )}
                {usr.website && (
                    <Badge color="#ffffff0f">
                        <a href={`https://${usr.website}`}>{usr.website}</a>
                    </Badge>
                )}
                {usr.org && <Badge color="#ffffff1a">Working at {usr.org}</Badge>}
                {usr.for_hire ? (
                    <Badge color="#30ff801a">Currently for hire</Badge>
                ) : (
                    <Badge color="#ffc8301a">Not currently for hire</Badge>
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
            {apps && (
                <>
                    <h2 className="mt-12  text-3xl text-white font-semibold">
                        All apps from {usr.name}
                    </h2>
                    {apps.map((app) => (
                        <>
                            <div className="p-4 rounded-xl mt-2 bg-[#ffffff20]">
                                <h3 className="text-xl text-white font-medium">{app.name}</h3>
                                <a href={`https://konbini.vercel.app/package/${app.id}`}>
                                    See in Konbini
                                </a>
                            </div>
                        </>
                    ))}
                    <h2 className="mt-12  text-3xl text-white font-semibold">Transparency</h2>
                    <Detail>
                        <svg
                            width="35"
                            height="35"
                            fill="none"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 2v6a2 2 0 0 0 2 2h6v10a2 2 0 0 1-2 2h-6.81A6.5 6.5 0 0 0 4 11.498V4a2 2 0 0 1 2-2h6Zm1.5.5V8a.5.5 0 0 0 .5.5h5.5l-6-6ZM6.5 23a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11Zm-1.146-7.646a.5.5 0 0 0-.708-.708l-2.5 2.5a.5.5 0 0 0 0 .708l2.5 2.5a.5.5 0 0 0 .708-.708L3.207 17.5l2.147-2.146Zm2.292-.708a.5.5 0 0 0 0 .708L9.793 17.5l-2.147 2.146a.5.5 0 0 0 .708.708l2.5-2.5a.5.5 0 0 0 0-.708l-2.5-2.5a.5.5 0 0 0-.708 0Z"
                                fill="#ffffff"
                            />
                        </svg>
                        <div className="flex flex-col">
                            <a href={manifestUrl} target="_blank" rel="noopener noreferrer">
                                Author manifest
                            </a>
                            <p className="text-xs font-light">
                                {manifestUrl
                                    .replace("https://github.com/HanaOrg/", "")
                                    .replace(
                                        `blob/main/${authorId.split(".")[0]}/${authorId.slice(0, 2)}`,
                                        "",
                                    )}
                            </p>
                        </div>
                    </Detail>
                </>
            )}
        </>
    );
}
