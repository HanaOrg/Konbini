import { useRoute } from "preact-iso";
import { useEffect, useState } from "preact/hooks";
import { searchPkg } from "shared/api/kdata";
import type { KDATA_ENTRY_PKG } from "shared/types/kdata";
import Nav from "../components/nav";
import AppGrid from "../components/app-grid";

export default function Search() {
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<KDATA_ENTRY_PKG[]>([]);
    const { query } = useRoute();

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

    return (
        <>
            <Nav />
            <div className="app-main-cont">
                <div className="bg-[#c23282] w-350 h-200 blur-[200px] opacity-[0.2] absolute top-[-300px] left-[-300px] z-[-1]" />
                {loading ? (
                    <h1>Searching "{query["q"]}" up...</h1>
                ) : results.length ? (
                    <AppGrid
                        apps={results}
                        title={`Results for "${query["q"]}".`}
                        desc={`Found ${results.length} packages. They're sorted by downloads (and alphabetically if these are equal).`}
                    />
                ) : (
                    <>
                        <h1>No results for "{query["q"]}"</h1>
                        <p>
                            Check you didn't misspell anything.
                            <br />
                            If you're sure it's right, maybe the package isn't yet on Konbini, or
                            perhaps you're just to original for us. Who knows?
                        </p>
                    </>
                )}
            </div>
        </>
    );
}
