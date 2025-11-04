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
            const popular = await getPkgs("d", 9);
            const recent = await getPkgs("r", 9);
            setMostDownloadedApps(Object.values(popular));
            setMostRecentApps(Object.values(recent));
            setLoading(false);
        }
        fetchApps();
    }, []);

    return (
        <>
            <Nav />
            <div className="app-main-cont" style={{ backgroundColor: "#121212" }}>
                <h1 style={{ color: "#fff", fontSize: "3em" }}>
                    Get some cool{" "}
                    <div class="rotating-words">
                        <span class="word">Flatpak</span>
                        <span class="word">SnapCraft</span>
                        <span class="word">Homebrew</span>
                        <span class="word">DPKG</span>
                        <span class="word">Nix</span>
                        <span class="word">WinGet</span>
                        <span class="word">Scoop</span>
                        <span class="word">Chocolatey</span>
                        <span class="word">Konbini</span>
                    </div>{" "}
                    apps
                </h1>
                <hr className="my-4" />
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
                <hr className="my-4" />
                <h2 style={{ fontSize: "3em" }}>
                    <span>Konbini</span> is the universal package manager
                </h2>
                <p>
                    <span>You're an app user?</span> Everyone is. Download and enjoy apps from
                    Konbini packages, Konpaks, DPKG, Flatpak, Snap, Homebrew, Nix, and more places
                    from a single, unified tool that deals with all package managers under the hood
                    for you and gives you the best experience.
                    <br />
                    <br />
                    <span>You're an app developer?</span> Get the best developer experience with the
                    easiest publishing in the market thanks to repository releases, and give your
                    package the nicest web homepage, even if not hosted with us.
                </p>
            </div>
            <Footer />
        </>
    );
}
