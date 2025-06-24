import { useEffect, useState } from "preact/hooks";
import { parse } from "yaml";
import AppPage from "./app-page";
import { fetchAPI } from "../../shared/api/network";
import { SRCSET } from "../../shared/constants";
import type { KONBINI_MANIFEST } from "../../shared/types/manifest";
import AppGrid from "./components/app-grid";
import Footer from "./components/footer";

type tEntryPoint = {
    path: string;
    name: string;
    _links: {
        self: string;
    };
}[];

export type MANIFEST_WITH_ID = KONBINI_MANIFEST & { id: string };

export function App() {
    const [apps, setApps] = useState<MANIFEST_WITH_ID[]>([]);
    const [page, setPage] = useState<string>("#");
    const [loading, setLoading] = useState<boolean>(true);

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

    if (page !== "#" || window.location.pathname !== "#")
        return <AppPage route={page == "#" ? window.location.pathname.replace("#", "") : page} />;

    return (
        <>
            <nav>
                <img
                    style={{ cursor: "pointer" }}
                    src="/konball.png"
                    alt="Konbini logo"
                    onClick={() => {
                        setPage("#");
                        window.location.pathname = "#";
                    }}
                />
                <h2 style={{ textAlign: "center", color: "orange" }}>
                    THIS IS NOT RELEASE SOFTWARE, it has been publicized for testing purposes.
                    <br />
                    IT IS NOT EXPECTED TO FEEL FINISHED OR BEHAVE PROPERLY.
                </h2>
            </nav>
            {loading ? <h1>Loading... Please wait</h1> : <AppGrid apps={apps} setPage={setPage} />}
            <Footer />
        </>
    );
}
