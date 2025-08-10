import { normalize, removeWhitespace } from "@zakahacecosas/string-utils";
import { useEffect, useState } from "preact/hooks";
import { parse } from "yaml";
import { b64toString, fetchAPI } from "shared/api/network";
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
};

export type MANIFEST_WITH_ID = KONBINI_MANIFEST & { id: string };

export async function retrieveAllApps() {
    const entryPoint = await (await fetchAPI(SRCSET.PKGsA)).json();
    const points = (entryPoint as tEntryPoint[]).filter((i) => i.path.length == 2);

    const manifestPoints: tEntryPoint[][] = [];

    manifestPoints.push(
        ...(await Promise.all(
            points.map(async (point) => await (await fetchAPI(point._links.self)).json()),
        )),
    );

    const manifestsTruePoints: (tEntryPoint & { content: string })[] = [];
    const _tmp = [];

    const manifests: MANIFEST_WITH_ID[] = [];

    for (const point of manifestPoints) {
        for (const p of point) {
            if (!p.name.endsWith(".yaml")) continue;
            _tmp.push(p._links.self);
        }
    }

    manifestsTruePoints.push(
        ...(await Promise.all(_tmp.map(async (i) => await (await fetchAPI(i)).json()))),
    );

    for (const point of manifestsTruePoints) {
        manifests.push({
            ...parse(b64toString(point.content)),
            id: `${parse(b64toString(point.content)).author}.${point.name.split(".")[0]}`,
        });
    }

    return manifests;
}

export default function Home() {
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

    function search(val: string) {
        const searchTerm = n(val);

        const items = document.querySelectorAll<HTMLElement>(".__konbini_item_info_giver");
        let visibleCount = 0;

        items.forEach((item) => {
            const actual = item.parentElement;
            if (!actual) throw "This broke, a Konbini info giver doesn't have a parent...";
            const text = n(item.innerText);

            if (text.includes(searchTerm)) {
                actual.classList.remove("hidden");
                visibleCount++;
            } else {
                actual.classList.add("hidden");
            }
        });

        const notFoundMessage = document.getElementById("not_found");
        const contentToHide = document.getElementsByClassName("hide_on_no_results");
        if (notFoundMessage) {
            if (visibleCount === 0) {
                notFoundMessage.classList.remove("hidden");
                for (const el of contentToHide) el.classList.add("hidden");
            } else {
                notFoundMessage.classList.add("hidden");
                for (const el of contentToHide) el.classList.remove("hidden");
            }
        }
    }

    useEffect(() => {
        async function fetchApps() {
            const manifests = await retrieveAllApps();

            setApps(manifests);
            setLoading(false);
        }
        fetchApps();
    }, []);

    return (
        <>
            <Nav />
            <div className="app-main-cont">
                <div className="bg-[#FF6F00] w-300 h-150 blur-[300px] opacity-[0.35] absolute top-[-250px] left-[-250px] z-[-1]" />
                <h1 style={{ color: "#fff", opacity: 0.9, fontSize: "6em" }}>
                    Your convenience store
                </h1>
                <input
                    type="search"
                    placeholder="Search packages"
                    onInput={(ev) => search(ev.currentTarget.value)}
                    className="w-full my-4 border-1 border-[#FFFFFF17] bg-[#FFFFFF14] px-4 py-3 focus:border-1 focus:border-[#FFFFFF5A] rounded-2xl focus:outline-none"
                />
                <div id="not_found" className="hidden">
                    <h1>We couldn't find anything...</h1>
                    <p>
                        Sorry about that. Perhaps the package wasn't added yet to Konbini, or
                        perhaps you're just too original.
                    </p>
                </div>
                {loading ? (
                    <h1>Loading, just one sec!</h1>
                ) : (
                    <AppGrid title="All packages" apps={apps} />
                )}
            </div>
            <Footer />
        </>
    );
}
