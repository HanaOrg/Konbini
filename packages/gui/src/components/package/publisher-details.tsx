import { isOrganization, type KONBINI_AUTHOR, type KONBINI_ID_USR } from "shared/types/author";
import Badge from "../badge";
import { toUpperCaseFirst } from "strings-utils";
import Detail from "../detail";
import { locateUsr } from "shared/api/core";
import type { KDATA_FILE_PKG } from "shared/types/kdata";
import { getContrastingTextColor } from "../../colors";
import { useEffect, useState } from "preact/hooks";
import { PiFileFill } from "react-icons/pi";

export default function PublisherDetails({
    authorId,
    usr,
    apps,
}: {
    authorId: KONBINI_ID_USR;
    usr: KONBINI_AUTHOR;
    apps: null | KDATA_FILE_PKG;
}) {
    const [accent, setAccent] = useState(document.documentElement.style.getPropertyValue("--k"));
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

    useEffect(() => {
        const update = () => {
            const val = document.documentElement.style.getPropertyValue("--k").trim();
            setAccent(val);
        };

        update();

        const obs = new MutationObserver(update);
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });

        return () => obs.disconnect();
    }, []);

    return (
        <>
            <h2 className="mt-12 text-3xl text-white font-semibold">Publisher details</h2>
            <p>
                This is {orgStr}.
                {apps && (
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
                    <Badge color="var(--k)" text={getContrastingTextColor(accent)}>
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
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={`https://${usr.website}`}
                        >
                            {usr.website}
                        </a>
                    </Badge>
                )}
                {(org ? usr.hiring : usr.for_hire) ? (
                    <Badge color="#30ff801a">Currently {org ? "hiring" : "for hire"}</Badge>
                ) : (
                    <Badge color="#ff30301a">Not currently {org ? "hiring" : "for hire"}</Badge>
                )}
                {usr.bs && <Badge color="var(--k-dimmed)">Bootstrapped package</Badge>}
            </div>
            {usr.socials && (
                <>
                    <p>Follow them</p>
                    <div className="flex flex-row gap-1 mt-2 mb-1">
                        {Object.entries(usr.socials).map((e) => (
                            <a
                                href={
                                    e[0] === "bluesky"
                                        ? `https://bsky.app/profile/${e[1]}`
                                        : `https://${e[0]}.com/${e[1]}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-2 px-4 bg-[#00000030]  hover:bg-[#00000060]"
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
                    <div className="grid grid-cols-4 gap-2">
                        {Object.entries(apps).map(([id, app]) => (
                            <Detail key={id} justify="start" className="w-full">
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
                        <PiFileFill size={35} />
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
