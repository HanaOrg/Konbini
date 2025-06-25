import { normalize, removeWhitespace } from "@zakahacecosas/string-utils";
import type { FormEvent } from "preact/compat";
import { useEffect, useState } from "preact/hooks";
import { parse } from "yaml";
import { fetchAPI } from "shared/api/network";
import { SRCSET } from "shared/constants";
import type { KONBINI_MANIFEST } from "shared/types/manifest";
import AppGrid from "../components/app-grid";
import Footer from "../components/footer";
import Nav from "../components/nav";

type tEntryPoint = {
    path: string;
    name: string;
    _links: {
        self: string;
    };
}[];

export type MANIFEST_WITH_ID = KONBINI_MANIFEST & { id: string };

export function Home() {
    const [apps, setApps] = useState<MANIFEST_WITH_ID[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

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

            if (text.includes(searchTerm)) {
                actual.classList.remove("hidden");
                visibleCount++;
            } else {
                actual.classList.add("hidden");
            }
        });

        const notFoundMessage = document.getElementById("not_found");
        if (notFoundMessage) {
            if (visibleCount === 0) {
                notFoundMessage.classList.remove("hidden");
            } else {
                notFoundMessage.classList.add("hidden");
            }
        }
    }

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
            setLoading(false);
        }
        fetchApps();
    }, []);

    return (
        <>
            <Nav />
            <div className="app-main-cont">
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
                {loading ? (
                    <h1>Loading... Please wait</h1>
                ) : (
                    <>
                        <p>
                            Since the amount of packages is very low, for now we just place them all
                            here. As we grow the amount we'll more specifically classify them.
                        </p>
                        <AppGrid title="All packages" apps={apps} />
                    </>
                )}
            </div>
            <Footer />
        </>
    );
}
