import { useEffect, useState } from "preact/hooks";
import AppGrid from "../components/app-grid";
import Footer from "../components/footer";
import Nav from "../components/nav";
import { getPkgs } from "shared/api/kdata";
import type { KDATA_ENTRY_PKG } from "shared/types/kdata";

export default function Home() {
    const [mostDownloadedApps, setMostDownloadedApps] = useState<KDATA_ENTRY_PKG[]>([]);
    const [mostRecentApps, setMostRecentApps] = useState<KDATA_ENTRY_PKG[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchApps() {
            const popular = await getPkgs("d", 6);
            const recent = await getPkgs("r", 6);
            setMostDownloadedApps(Object.values(popular));
            setMostRecentApps(Object.values(recent));
            setLoading(false);
        }
        fetchApps();
    }, []);

    return (
        <>
            <Nav />
            <div className="app-main-cont">
                <div className="bg-[var(--k)] w-300 h-150 blur-[260px] opacity-[0.5] absolute top-[-250px] left-[-250px] z-[-1]" />
                <h1 style={{ color: "#fff", opacity: 0.9, fontSize: "6em" }}>
                    Your convenience store
                </h1>
                <hr className="my-6" />
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
                    <div className="flex flex-col gap-8">
                        <AppGrid
                            title="Most downloaded"
                            desc="The most downloaded apps of the moment"
                            apps={mostDownloadedApps}
                        />
                        <AppGrid
                            title="Recently updated"
                            desc="Apps that got updated recently"
                            apps={mostRecentApps}
                        />
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}
