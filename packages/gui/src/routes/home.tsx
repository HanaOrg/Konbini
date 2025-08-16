import { useEffect, useState } from "preact/hooks";
import AppGrid from "../components/app-grid";
import Footer from "../components/footer";
import Nav from "../components/nav";
import { useLocation } from "preact-iso";
import { getPkgs } from "shared/api/kdata";
import type { KDATA_ENTRY_PKG } from "shared/types/kdata";

export default function Home() {
    const [mostDownloadedApps, setMostDownloadedApps] = useState<KDATA_ENTRY_PKG[]>([]);
    const [mostRecentApps, setMostRecentApps] = useState<KDATA_ENTRY_PKG[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { route } = useLocation();

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
                <div className="bg-[#FF6F00] w-300 h-150 blur-[300px] opacity-[0.35] absolute top-[-250px] left-[-250px] z-[-1]" />
                <h1 style={{ color: "#fff", opacity: 0.9, fontSize: "6em" }}>
                    Your convenience store
                </h1>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        route(`/search?q=${e.currentTarget["search"]["value"]}`);
                    }}
                >
                    <input
                        type="search"
                        name="search"
                        placeholder="Search packages"
                        className="w-full my-4 border-1 border-[#FFFFFF17] bg-[#FFFFFF14] px-4 py-3 focus:border-1 focus:border-[#FFFFFF5A] rounded-2xl focus:outline-none"
                    />
                </form>
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
