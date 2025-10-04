import { useEffect, useState } from "preact/hooks";
import { getAgeRating, isValidManifest } from "shared/types/manifest";
import { locatePkg } from "shared/api/core";
import { micromark } from "micromark";
import DOMPurify from "dompurify";
import { getDesktopPlatform } from "../ua";
import PlatformSupport from "../components/package/platform-support";
import Nav from "../components/nav";
import Footer from "../components/footer";
import InstallDialog from "../components/package/install-dialog";
import Badge from "../components/badge";
import { toUpperCaseFirst } from "@zakahacecosas/string-utils";
import { type KONBINI_AUTHOR, type KONBINI_ID_PKG } from "shared/types/author";
import PublisherDetails from "../components/package/publisher-details";
import ScreenshotSlideshow from "../components/package/screenshots";
import SystemRequirementsTable from "../components/package/sys-req";
import MaintainersList from "../components/package/maintainers";
import PackageDetails from "../components/package/details";
import { getAuthor, getPkg, scanPackage, type KONBINI_LOCAL_SCAN } from "shared/api/kdata";
import type { KDATA_ENTRY_PKG } from "shared/types/kdata";
import DownloadChart from "../components/package/downloads";
import InsecurePackage from "../components/insecure";
import { getContrastingTextColor, accentPage } from "../colors";

export default function PackagePage() {
    const [app, setApp] = useState<KDATA_ENTRY_PKG>();
    const [author, setAuthor] = useState<KONBINI_AUTHOR>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [secure, setSecure] = useState<KONBINI_LOCAL_SCAN | null>(null);

    const route = window.location.pathname.split("/package/").filter(Boolean)[0] as KONBINI_ID_PKG;
    const plat = getDesktopPlatform();

    useEffect(() => {
        async function getApp() {
            try {
                const manifest = await getPkg(route);
                const isSecure = await scanPackage(
                    `${route}@${manifest.latest_release}@${plat.asSupported}`,
                );
                const pkgAuthor = await getAuthor(manifest.author);
                setSecure(isSecure);
                setAuthor(pkgAuthor);
                setApp(manifest);
                setLoading(false);
            } catch (error) {
                if (String(error).includes("does NOT exist")) {
                    window.location.pathname = "/404";
                    return;
                }
                setError(String(error));
                throw error;
            }
        }
        getApp();
    }, []);

    if (error) return <h1>Error: {error}</h1>;
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
    if (!isValidManifest(app))
        return (
            <>
                <h1>Invalid manifest</h1>
                <p>
                    This app has an improper manifest. Tell his developer to check it.
                    <br />
                    <a href="/">Go back.</a>
                </p>
            </>
        );

    useEffect(() => {
        accentPage(app.accent);
    }, []);

    const isSupported = app.platforms
        ? (plat.plat == "Windows" && app.platforms.win64) ||
          (plat.plat == "macOS" && plat.arch == "64" && app.platforms.mac64) ||
          (plat.plat == "macOS" && plat.arch == "ARM" && app.platforms.macArm) ||
          (plat.plat == "Linux" && plat.arch == "64" && app.platforms.linux64) ||
          (plat.plat == "Linux" && plat.arch == "ARM" && app.platforms.linuxArm)
        : false;
    /** for when we don't know the arch but know the OS */
    const isPossiblySupported =
        (plat.plat == "macOS" && (app.platforms.mac64 || app.platforms.macArm)) ||
        (plat.plat == "Linux" && (app.platforms.linux64 || app.platforms.linuxArm));

    const supportString = isSupported
        ? "Works on your device"
        : isPossiblySupported
          ? "Maybe works on your device"
          : "Does not work on your device";
    const supportColor = isSupported
        ? "var(--k-lighter)"
        : isPossiblySupported
          ? "#FF7C65"
          : "#FF3863";
    const age = getAgeRating(app.age_rating);

    return (
        <>
            {secure !== null && !Object.values(secure.results).every((v) => v == true) && (
                <InsecurePackage res={secure} app={app} />
            )}
            <div className="bg-[var(--k)] w-128 h-128 blur-[300px] opacity-[0.6] absolute top-[-150px] right-[-150px] z-[-1]" />
            <div className="bg-[var(--k)] w-128 h-128 blur-[300px] opacity-[0.7] absolute top-[650px] left-[-150px] z-[-1]" />
            <div className="bg-[var(--k)] w-128 h-128 blur-[300px] opacity-[0.4] absolute bottom-[50px] right-[-300px] z-[-1]" />
            <Nav />
            <InstallDialog appName={app.name} appId={route} />
            <div className="app-main-cont">
                <div className="flex flex-row">
                    {app.icon && (
                        <img
                            className="w-24 h-24 rounded-2xl mr-4"
                            src={app.icon}
                            alt={`${app.name}'s icon.`}
                        />
                    )}
                    <div className="flex flex-col w-fit min-w-[50%] gap-0">
                        <h1 className="grad">{app.name}</h1>
                        <h2 className="text-xl text-white opacity-[0.8] mb-2 italic w-[60%]">
                            {app.slogan}
                        </h2>
                        <h2 className="text-lg text-white opacity-[0.5] mb-2">
                            {app.downloads.active} active installs (est.)
                        </h2>
                        <div className="flex flex-row gap-1">
                            <Badge color="var(--k-dimmed)">
                                By{" "}
                                <a href={`https://konbini.vercel.app/author/${app.author}`}>
                                    {app.author}
                                </a>
                            </Badge>
                            {author.verified && (
                                <Badge
                                    color="var(--k)"
                                    text={getContrastingTextColor(
                                        document.documentElement.style.getPropertyValue("--k"),
                                    )}
                                >
                                    Verified developer
                                </Badge>
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
                            >
                                {age === "everyone"
                                    ? "For everyone"
                                    : age === "mid"
                                      ? "May be inappropriate for kids"
                                      : age === "high"
                                        ? "Inappropriate for kids"
                                        : "Inappropriate for young users"}
                            </Badge>
                            {app.telemetry && (
                                <Badge color="#FF8C001A">Shares telemetry data</Badge>
                            )}
                            {(app.categories || []).map((c) => (
                                <Badge key={c} color="#FFE8BF1A">
                                    {toUpperCaseFirst(c)}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <div className="ml-auto h-fit text-xl flex flex-col items-end gap-2">
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
                            style={{
                                color:
                                    isSupported || isPossiblySupported
                                        ? getContrastingTextColor(
                                              document.documentElement.style.getPropertyValue(
                                                  "--k",
                                              ),
                                          )
                                        : undefined,
                            }}
                        >
                            Download
                        </button>
                        <div className="text-base text-end" style={{ color: supportColor }}>
                            {supportString}.<br />
                            {app.type === "both"
                                ? "Both CLI and GUI app."
                                : app.type === "cli"
                                  ? "Command Line app."
                                  : "Graphical app."}
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
                {app.changelog && (
                    <>
                        <hr className="mt-6" />
                        <h2 className="mt-6 text-3xl text-white font-semibold">
                            Changelog for the latest update
                        </h2>
                        <p className="mb-4 text-white font-semibold">
                            Published {new Date(app.last_release_at).toUTCString()}
                        </p>
                        <div
                            className="markdown"
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(
                                    micromark(app.changelog.replaceAll("\\n", "\n"), {}),
                                ),
                            }}
                        />
                    </>
                )}
                {app.images && app.images.length > 0 && <ScreenshotSlideshow ss={app.images} />}
                <h2 className="mt-12 mb-4 text-3xl text-white font-semibold">Platform support</h2>
                <PlatformSupport platforms={app.platforms} />
                <PackageDetails app={app} manifestUrl={locatePkg(route).manifestPub} />
                {app.requirements && <SystemRequirementsTable requirements={app.requirements} />}
                <PublisherDetails authorId={app.author} usr={author} apps={null} />
                {app.maintainers && (
                    <MaintainersList maintainers={app.maintainers} author={author.name} />
                )}
                {(app.downloads.installs.length > 0 || app.downloads.removals.length > 0) && (
                    <DownloadChart downloads={app.downloads} />
                )}
            </div>
            <Footer />
        </>
    );
}
