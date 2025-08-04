import { useEffect, useState } from "preact/hooks";
import { getAgeRating, type KONBINI_MANIFEST } from "shared/types/manifest";
import { getPkgManifest, getUsrManifest, locatePkg } from "shared/api/core";
import { micromark } from "micromark";
import DOMPurify from "dompurify";
import { getDesktopPlatform } from "../ua";
import PlatformSupport from "../components/package/platform-support";
import Nav from "../components/nav";
import Footer from "../components/footer";
import InstallDialog from "../components/package/install-dialog";
import Badge from "../components/badge";
import { toUpperCaseFirst } from "@zakahacecosas/string-utils";
import { type KONBINI_AUTHOR } from "shared/types/author";
import PublisherDetails from "../components/package/publisher-details";
import ScreenshotSlideshow from "../components/package/screenshots";
import SystemRequirementsTable from "../components/package/sys-req";
import MaintainersList from "../components/package/maintainers";
import PackageDetails from "../components/package/details";
import { getDownloads } from "shared/api/telemetry";

export default function PackagePage() {
    const [app, setApp] = useState<KONBINI_MANIFEST>();
    const [author, setAuthor] = useState<KONBINI_AUTHOR>();
    const [loading, setLoading] = useState<boolean>(true);
    const [downloads, setDownloads] = useState<{
        downloads: number;
        removals: number;
        product: number;
    }>({
        downloads: 0,
        removals: 0,
        product: 0,
    });

    const route = window.location.pathname.split("/package/").filter(Boolean)[0]!;
    const manifestUrl =
        locatePkg(route).replace("raw.githubusercontent", "github").replace("main", "blob/main") +
        "/" +
        route +
        ".yaml";

    useEffect(() => {
        async function getApp() {
            try {
                const manifest = await getPkgManifest(route, true);
                const pkgAuthor = await getUsrManifest(manifest.author_id);
                const downloads = await getDownloads(route);
                setAuthor(pkgAuthor);
                setApp(manifest);
                setLoading(false);
                setDownloads(downloads);
            } catch (error) {
                if (String(error).includes("does NOT exist")) {
                    window.location.pathname = "/404";
                    return;
                }
                console.error(error);
                throw error;
            }
        }
        getApp();
    }, []);

    if ((!app || !author) && loading)
        return (
            <>
                <div className="bg-[#8800FF] w-128 h-128 blur-[300px] opacity-[0.75] absolute top-[650px] left-[-50px] z-[-1]" />
                <div className="bg-[#FF07EA] w-128 h-128 blur-[300px] opacity-[0.65] absolute bottom-[50px] right-[-300px] z-[-1]" />
                <div className="bg-[#C23282] w-128 h-128 blur-[300px] opacity-[0.50] absolute top-[-150px] right-[-150px] z-[-1]" />
                <h1>Loading package "{route}"...</h1>
            </>
        );
    if (!app) return <h1>Error loading {route}. Failed to load app.</h1>;
    if (!author)
        return <h1>Error loading {route}. The app itself loaded, but its author's data didn't.</h1>;

    const plat = getDesktopPlatform();

    const isSupported =
        (plat.plat == "Windows" && app.platforms.win64) ||
        (plat.plat == "macOS" && plat.arch == "64" && app.platforms.mac64) ||
        (plat.plat == "macOS" && plat.arch == "ARM" && app.platforms.macArm) ||
        (plat.plat == "Linux" && plat.arch == "64" && app.platforms.linux64) ||
        (plat.plat == "Linux" && plat.arch == "ARM" && app.platforms.linuxArm);
    /** for when we don't know the arch but know the OS */
    const isPossiblySupported =
        (plat.plat == "macOS" && (app.platforms.mac64 || app.platforms.macArm)) ||
        (plat.plat == "Linux" && (app.platforms.linux64 || app.platforms.linuxArm));

    const supportString = isSupported
        ? "Works on your device"
        : isPossiblySupported
          ? "Maybe works on your device"
          : "Does not work on your device";
    const supportColor = isSupported ? "#FFC3C4" : isPossiblySupported ? "#FF7C65" : "#FF3863";
    const age = getAgeRating(app.age_rating);

    return (
        <>
            <div className="bg-[#8800FF] w-128 h-128 blur-[300px] opacity-[0.75] absolute top-[650px] left-[-50px] z-[-1]" />
            <div className="bg-[#FF07EA] w-128 h-128 blur-[300px] opacity-[0.65] absolute bottom-[50px] right-[-300px] z-[-1]" />
            <div className="bg-[#C23282] w-128 h-128 blur-[300px] opacity-[0.50] absolute top-[-150px] right-[-150px] z-[-1]" />
            <Nav />
            <InstallDialog appName={app.name} appId={route} />
            <div className="app-main-cont">
                <div className="flex flex-row gap-4">
                    {app.icon && (
                        <img
                            className="w-24 h-24 rounded-2xl"
                            src={app.icon}
                            alt={`${app.name}'s icon.`}
                        />
                    )}
                    <div className="flex flex-col w-fit gap-0">
                        <h1 className="grad">{app.name}</h1>
                        <h2 className="text-xl text-white opacity-[0.7] mb-2">{app.slogan}</h2>
                        <h2 className="text-lg text-white opacity-[0.5] mb-2">
                            {downloads.product} active installs (est.)
                        </h2>
                        <div className="flex flex-row gap-1">
                            <Badge text={`By ${app.author_id}`} color="#ffffff1a" />
                            {author.verified && (
                                <Badge text="Verified developer" color="#c232826a" />
                            )}
                        </div>
                        <div className="flex flex-row gap-1 mt-1">
                            <Badge
                                color={
                                    age === "everyone"
                                        ? "#00FF6F1a"
                                        : age === "mid"
                                          ? "#FF8C001A"
                                          : age === "high"
                                            ? "#FF6C002A"
                                            : "#FF1C003A"
                                }
                                text={
                                    age === "everyone"
                                        ? "For everyone"
                                        : age === "mid"
                                          ? "May be inappropriate for kids"
                                          : age === "high"
                                            ? "Inappropriate for kids"
                                            : "Inappropriate for young users"
                                }
                            />
                            {app.telemetry && (
                                <Badge text="Shares telemetry data" color="#FF8C001A" />
                            )}
                            {app.categories.map((c) => (
                                <Badge text={toUpperCaseFirst(c)} color="#FFE8BF1A" />
                            ))}
                        </div>
                    </div>
                    <div className="ml-auto h-fit text-xl flex flex-col items-end gap-4">
                        <button
                            onClick={() => {
                                const m = document.querySelector("#install_dialog");
                                if (!m) {
                                    console.error("No modal rendered?");
                                    return;
                                }
                                if (!isSupported && !isPossiblySupported) {
                                    console.warn("Unsupported");
                                    return;
                                }
                                (m as HTMLDialogElement).showModal();
                            }}
                            className={
                                isSupported || isPossiblySupported ? "" : "button-unsupported"
                            }
                        >
                            Download
                        </button>
                        <div className="text-base" style={{ color: supportColor }}>
                            {supportString}
                        </div>
                    </div>
                </div>
                <br />
                <div
                    className="markdown"
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(micromark(app.desc.replaceAll("\\n", "\n"))),
                    }}
                />
                {app.screenshot_urls && app.screenshot_urls.length > 0 && (
                    <ScreenshotSlideshow ss={app.screenshot_urls} />
                )}
                <h2 className="mt-12 mb-4 text-3xl text-white font-semibold">Platform support</h2>
                <PlatformSupport platforms={app.platforms} />
                <PackageDetails app={app} manifestUrl={manifestUrl} />
                {app.sys_requirements && (
                    <SystemRequirementsTable requirements={app.sys_requirements} />
                )}
                <PublisherDetails authorId={app.author_id} usr={author} apps={null} />
                {app.maintainers && (
                    <MaintainersList maintainers={app.maintainers} author={author.name} />
                )}
            </div>
            <Footer />
        </>
    );
}
