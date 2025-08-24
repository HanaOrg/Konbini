import { isOrganization, type KONBINI_AUTHOR, type KONBINI_ID_USR } from "shared/types/author";
import Badge from "../badge";
import { toUpperCaseFirst } from "@zakahacecosas/string-utils";
import Detail from "../detail";
import { locateUsr } from "shared/api/core";
import type { KDATA_FILE_PKG } from "shared/types/kdata";
import { getContrastingTextColor } from "../../hex";

export default function PublisherDetails({
    authorId,
    usr,
    apps,
}: {
    authorId: KONBINI_ID_USR;
    usr: KONBINI_AUTHOR;
    apps: null | KDATA_FILE_PKG;
}) {
    const manifestUrl = locateUsr(authorId).manifestPub;

    const org = isOrganization(usr);
    const orgStr = org
        ? usr.type === "PRIVATE_CORP"
            ? "a private corporation"
            : usr.type === "GOVT_ORG"
              ? "a public/government organization"
              : usr.type === "NON_PROFIT"
                ? "a non-profit organization"
                : usr.type === "COLLAB_ORG"
                  ? "a collab organization"
                  : "an organization"
        : "a regular user";

    return (
        <>
            <h2 className="mt-12 text-3xl text-white font-semibold">Publisher details</h2>
            <p>
                This is {orgStr}.
                {apps !== null ? (
                    ""
                ) : (
                    <>
                        {" "}
                        See more details and other apps from them{" "}
                        <a href={`https://konbini.vercel.app/author/${authorId}`}>here</a>.
                    </>
                )}
            </p>
            <div className="flex flex-row gap-1 mt-2 mb-1">
                <Badge color="#ffffff3a">{usr.name}</Badge>
                {usr.verified && (
                    <Badge
                        color="var(--k)"
                        text={getContrastingTextColor(
                            document.documentElement.style.getPropertyValue("--k"),
                        )}
                    >
                        This {orgStr === "a regular user" ? "user" : "organization"} is verified
                    </Badge>
                )}
            </div>
            <div className="flex flex-row gap-1 mb-2">
                {usr.email && (
                    <Badge color="var(--k-dimmed)">
                        <a href={`mailto:${usr.email}`}>{usr.email}</a>
                    </Badge>
                )}
                {usr.website && (
                    <Badge color="var(--k-dimmed)">
                        <a href={`https://:${usr.website}`}>{usr.website}</a>
                    </Badge>
                )}
                {(org ? usr.hiring : usr.for_hire) ? (
                    <Badge color="#30ff801a">Currently {org ? "hiring" : "for hire"}</Badge>
                ) : (
                    <Badge color="#ff30301a">Not currently {org ? "hiring" : "for hire"}</Badge>
                )}
            </div>
            {usr.socials && (
                <>
                    <p>Follow them</p>
                    <div className="flex flex-row gap-1 mt-2 mb-1">
                        {Object.entries(usr.socials!).map((e) => (
                            <a
                                href={`https://${e[0]}.com/${e[1]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-2 px-4 bg-[#00000030] rounded-xl hover:bg-[#00000060]"
                            >
                                {toUpperCaseFirst(e[0])} @{e[1]}
                            </a>
                        ))}
                    </div>
                </>
            )}
            {apps && (
                <>
                    <h2 className="mt-12 mb-4 text-3xl text-white font-semibold">
                        All apps from {usr.name}
                    </h2>
                    <div className="flex flex-row gap-2 wrap">
                        {Object.entries(apps).map(([id, app]) => (
                            <Detail justify="start" className="flex-grow-1">
                                {app.icon && (
                                    <img
                                        src={app.icon}
                                        width={50}
                                        height={50}
                                        className="object-scale-down"
                                    />
                                )}
                                <div className="flex flex-col">
                                    <h3 className="text-2xl text-white font-medium">{app.name}</h3>
                                    <a href={`https://konbini.vercel.app/package/${id}`}>
                                        See in Konbini
                                    </a>
                                </div>
                            </Detail>
                        ))}
                    </div>
                    <h2 className="mt-12 mb-4 text-3xl text-white font-semibold">Transparency</h2>
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
