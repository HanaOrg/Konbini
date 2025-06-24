import { useEffect, useState } from "preact/hooks";
import { parse } from "yaml";
import AppPage from "./app-page";
import { fetchAPI } from "../../shared/api/network";
import { SRCSET } from "../../shared/constants";
import type { KONBINI_MANIFEST } from "../../shared/types/manifest";
import { normalize, removeWhitespace } from "@zakahacecosas/string-utils";
import type { FormEvent } from "preact/compat";

type tEntryPoint = {
    path: string;
    name: string;
    _links: {
        self: string;
    };
}[];

type MANIFEST_WITH_ID = KONBINI_MANIFEST & { id: string };

export function App() {
    const [apps, setApps] = useState<MANIFEST_WITH_ID[]>([]);
    const [page, setPage] = useState<string>("/");

    useEffect(() => {
        async function fetchApps() {
            const entryPoint = await (await fetchAPI(SRCSET.PKGsA)).json();
            const points = (entryPoint as tEntryPoint).filter((i) => i.path.length == 2);

            const manifestPoints: tEntryPoint[] = [];

            for (const point of points) {
                manifestPoints.push(await (await fetchAPI(point._links.self)).json());
            }

            const manifestsTruePoints: tEntryPoint & { content: string }[] = [];

            const manifests: MANIFEST_WITH_ID[] = [];

            for (const point of manifestPoints) {
                for (const p of point) {
                    if (!p.name.endsWith(".yaml")) continue;
                    manifestsTruePoints.push(
                        JSON.parse(await (await fetchAPI(p._links.self)).text()),
                    );
                }
            }

            for (const point of manifestsTruePoints) {
                manifests.push({
                    ...parse(atob(point.content)),
                    id: point.name.split(".")[0],
                });
            }

            setApps(manifests);
        }
        fetchApps();
    }, []);

    const n = (s: string) =>
        removeWhitespace(
            normalize(s, {
                removeCliColors: true,
                strict: true,
                preserveCase: false,
            }),
        );

    function search(event: FormEvent<HTMLInputElement>) {
        const input = event.target as HTMLInputElement;
        const searchTerm = n(input.value);

        const items = document.querySelectorAll<HTMLElement>(".__konbini_item_info_giver");
        let visibleCount = 0;

        items.forEach((item) => {
            const actual = item.parentElement;
            if (!actual)
                throw new Error("This broke, a konbini info giver doesn't have a parent...");
            const text = n(item.innerText);
            console.debug(actual);

            if (text.includes(searchTerm)) {
                actual.classList.remove("hidden");
                visibleCount++;
            } else {
                actual.classList.add("hidden");
            }
        });

        console.debug(visibleCount);

        const notFoundMessage = document.getElementById("not_found");
        if (notFoundMessage) {
            if (visibleCount === 0) {
                notFoundMessage.classList.remove("hidden");
            } else {
                notFoundMessage.classList.add("hidden");
            }
        }
    }

    if (page !== "/" || window.location.pathname !== "/")
        return <AppPage route={page == "/" ? window.location.pathname.replace("/", "") : page} />;

    return (
        <>
            <nav>
                <img
                    style={{ cursor: "pointer" }}
                    src="/konball.png"
                    alt="Konbini logo"
                    onClick={() => {
                        setPage("/");
                        window.location.pathname = "/";
                    }}
                />
            </nav>
            <div className="app-main-cont">
                <h2>Explore Konbini packages</h2>
                <input
                    type="search"
                    placeholder="Search for something specific"
                    onInput={(event) => search(event)}
                />
                <div id="not_found" className="hidden">
                    <h1>We couldn't find anything?</h1>
                    <p>
                        Sorry about that. Perhaps the package wasn't added yet to Konbini, or
                        perhaps you're just too original.
                    </p>
                </div>
                {apps.length ? (
                    <div className="app-grid">
                        {apps.map((app) => (
                            <div className="app-card">
                                <div className="hidden __konbini_item_info_giver">
                                    {app.name}
                                    {app.slogan}
                                </div>
                                <h3 key={app.name}>{app.name}</h3>
                                <p>{app.slogan}</p>
                                <button
                                    onClick={() => {
                                        window.location.pathname = "/" + app.id;
                                        setPage(app.id);
                                    }}
                                >
                                    More info
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <h1>Loading, please wait...</h1>
                )}
            </div>
        </>
    );
}
