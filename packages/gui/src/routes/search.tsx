import { useLocation, useRoute } from "preact-iso";
import { useEffect, useState } from "preact/hooks";
import { searchPkg } from "shared/api/kdata";
import type { KDATA_ENTRY_PKG } from "shared/types/kdata";
import Nav from "../components/nav";
import AppGrid from "../components/app-grid";

export default function Search() {
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<KDATA_ENTRY_PKG[]>([]);
    const { query } = useRoute();
    const { route } = useLocation();

    useEffect(() => {
        async function handler() {
            const q = query["q"];
            if (!q) {
                setResults([]);
                setLoading(false);
                return;
            }
            const res = await searchPkg(q);
            setResults(res);
            setLoading(false);
        }
        handler();
    }, []);

    if (loading) return <h1>loading</h1>;

    return (
        <>
            <Nav />
            <div className="app-main-cont">
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
                <div className="bg-[#c23282] w-350 h-200 blur-[200px] opacity-[0.2] absolute top-[-300px] left-[-300px] z-[-1]" />
                {results.length ? (
                    <AppGrid
                        apps={results}
                        title={`Results for "${query["q"]}".`}
                        desc={`Found ${results.length} packages. They're sorted by downloads (and alphabetically if these are equal).`}
                    />
                ) : (
                    <h1>No results</h1>
                )}
            </div>
        </>
    );
}
