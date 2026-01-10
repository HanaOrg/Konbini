import { useEffect, useState } from "preact/hooks";
import { getAgeRating } from "shared/types/manifest";
import { locatePkg } from "shared/api/core";
import { micromark } from "micromark";
import DOMPurify from "dompurify";
import { getDesktopPlatform } from "../ua";
import PlatformSupport from "../components/package/platform-support";
import Nav from "../components/nav";
import Footer from "../components/footer";
import InstallDialog from "../components/package/install-dialog";
import Badge from "../components/badge";
import { toUpperCaseFirst } from "strings-utils";
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
import { PiDownloadSimple } from "react-icons/pi";

export default function PackagePage() {
    const [app, setApp] = useState<KDATA_ENTRY_PKG>();
    const [author, setAuthor] = useState<KONBINI_AUTHOR>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [secure, setSecure] = useState<KONBINI_LOCAL_SCAN | null>(null);
    const [isSupported, setIsSupported] = useState<boolean>(false);
    const [isPossiblySupported, setIsPossiblySupported] = useState<boolean>(false);
    const [age, setAge] = useState<"everyone" | "mid" | "high" | "very_high">("mid");

    const route = window.location.pathname.split("/package/").filter(Boolean)[0] as KONBINI_ID_PKG;
    const plat = getDesktopPlatform();

    useEffect(() => {
        async function getApp() {
            try {
                const manifest = await getPkg(route);
                const isSecure = await scanPackage(
                    `${route}@${manifest.latest_release}@${plat.asSupported}`,
                ).catch((e) => {
                    if (String(e).includes("404"))
                        return {
                            isSafe: true,
                            date: "",
                            results: {
                                safe: true,
                                authentic: true,
                                integral: true,
                                hash: "",
                                ver: "",
                            },
                        };
                    else throw e;
                });
                const pkgAuthor = await getAuthor(manifest.author);
                setSecure(isSecure);
                setAuthor(pkgAuthor);
                setApp(manifest);
                accentPage(manifest.accent);
                setIsSupported(
                    manifest.platforms
                        ? (plat.plat == "Windows" &&
                              typeof manifest.platforms.win64 === "string") ||
                              (plat.plat == "macOS" &&
                                  plat.arch == "64" &&
                                  typeof manifest.platforms.mac64 === "string") ||
                              (plat.plat == "macOS" &&
                                  plat.arch == "ARM" &&
                                  typeof manifest.platforms.macArm === "string") ||
                              (plat.plat == "Linux" &&
                                  plat.arch == "64" &&
                                  typeof manifest.platforms.linux64 === "string") ||
                              (plat.plat == "Linux" &&
                                  plat.arch == "ARM" &&
                                  typeof manifest.platforms.linuxArm === "string") ||
                              false
                        : false,
                );
                /** for when we don't know the arch but know the OS */
                setIsPossiblySupported(
                    (plat.plat == "macOS" &&
                        (typeof manifest.platforms.mac64 === "string" ||
                            typeof manifest.platforms.macArm === "string")) ||
                        (plat.plat == "Linux" &&
                            (typeof manifest.platforms.linux64 === "string" ||
                                typeof manifest.platforms.linuxArm === "string")),
                );
                setAge(getAgeRating(manifest.age_rating));
            } catch (e) {
                if (String(error).includes("does NOT exist")) {
                    window.location.pathname = "/404";
                    return;
                }
                setError(String(error));
            } finally {
                setLoading(false);
            }
        }
        getApp();
    }, []);

    if (loading) {
        return (
            <>
                <div className="bg-[#8800FF] w-lg h-128 blur-[300px] opacity-[0.75] absolute top-[650px] left-[-50px] z-[-1]" />
                <div className="bg-[#FF07EA] w-lg h-128 blur-[300px] opacity-[0.65] absolute bottom-[50px] right-[-300px] z-[-1]" />
                <div className="bg-[#C23282] w-lg h-128 blur-[300px] opacity-[0.50] absolute top-[-150px] right-[-150px] z-[-1]" />
                <h1>Loading package "{route}"...</h1>
            </>
        );
    }
    if (!app || !author)
        return (
            <>
                <h1>Oops! An error happened</h1>
                <p>
                    {error ??
                        "An unknown error prevented the app from loading. That's all we know."}
                    <br />
                    <a href="/">Go back.</a>
                </p>
            </>
        );

    const [accent, setAccent] = useState(document.documentElement.style.getPropertyValue("--k"));

    useEffect(() => {
        const update = () => {
            const val = document.documentElement.style.getPropertyValue("--k").trim();
            setAccent(val);
        };

        update();

        const obs = new MutationObserver(update);
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });

        return () => obs.disconnect();
    }, []);

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

    return (
        <>
            {secure &&
                ![secure.results.authentic, secure.results.integral, secure.results.safe].every(
                    (v) => v == true,
                ) && <InsecurePackage res={secure} app={app} />}
            <div className="bg-(--k) w-lg h-128 blur-[300px] opacity-[0.6] absolute top-[-150px] right-[-150px] z-[-1]" />
            <div className="bg-(--k) w-lg h-128 blur-[300px] opacity-[0.7] absolute top-[650px] left-[-150px] z-[-1]" />
            <div className="bg-(--k) w-lg h-128 blur-[300px] opacity-[0.4] absolute bottom-[50px] right-[-300px] z-[-1]" />
            <Nav />
            <InstallDialog
                appName={app.name}
                appId={route}
                supported={isSupported || isPossiblySupported}
            />
            <div className="app-main-cont">
                <div className="flex flex-row">
                    {app.icon && (
                        <img
                            className="w-24 h-24  mr-4"
                            src={"https://" + app.icon}
                            alt={`${app.name}'s icon.`}
                        />
                    )}
                    <div className="flex flex-col w-fit min-w-[50%] gap-0">
                        <h1 className="grad">{app.name}</h1>
                        <h2 className="text-xl text-white opacity-[0.8] mb-2 italic w-[70%]">
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
                            {app.bs && <Badge color="var(--k-dimmed)">Bootstrapped package</Badge>}
                            {author.verified && (
                                <Badge color="var(--k)" text={getContrastingTextColor(accent)}>
                                    [√] Verified
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
                                const m = document.getElementById("install_dialog");
                                if (!m) {
                                    console.error("No modal rendered?");
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
                                        ? getContrastingTextColor(accent)
                                        : undefined,
                            }}
                        >
                            <PiDownloadSimple />
                            Download
                        </button>
                        <div className="text-base text-end" style={{ color: supportColor }}>
                            {supportString}.<br />
                            {app.type === "both"
                                ? "Both CLI and GUI app."
                                : app.type === "cli"
                                  ? "Command Line app."
                                  : "Graphical app."}
                            <br />
                            {app.latest_release &&
                                app.last_release_at &&
                                `Known version ${app.latest_release} (released ${app.last_release_at}).`}
                        </div>
                    </div>
                </div>
                <br />
                <div
                    className="markdown"
                    dangerouslySetInnerHTML={{
                        // since we get to review every manifest that shows up in the store, we can keep this unsanitized because of the flathub API returning HTML
                        // TODO - update usage of the API so it returns markdown, so we can change this *just in case*
                        __html: micromark(app.desc.replaceAll("\\n", "\n"), {
                            allowDangerousHtml: true,
                        }),
                    }}
                />
                {app.changelog && (
                    <>
                        <hr className="mt-6" />
                        <h2 className="mt-6 text-3xl text-white font-semibold">
                            Changelog for the latest update
                        </h2>
                        <p className="mb-4 text-white font-semibold">
                            {app.last_release_at ? (
                                `Published ${new Date(app.last_release_at).toUTCString()}`
                            ) : (
                                <i>Exact release date unknown.</i>
                            )}
                        </p>
                        <div
                            className="markdown"
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(
                                    micromark(app.changelog.replaceAll("\\n", "\n"), {}),
                                ),
                            }}
                        />
                        <hr className="mt-6" />
                    </>
                )}
                {app.images && app.images.length > 0 && <ScreenshotSlideshow ss={app.images} />}
                <hr className="mt-6" />
                <h2 className="mt-12 mb-2 text-3xl text-white font-semibold">Platform support</h2>
                <h3 className="mb-4 text-lg">Note that this refers to platforms where a Konbini install is supported. The package just might be available for platforms not shown here, via a distribution method not supported by Konbini.</h3>
                <PlatformSupport platforms={app.platforms} />
                <PackageDetails app={app} manifestUrl={locatePkg(route).manifestPub} />
                {app.requirements && <SystemRequirementsTable requirements={app.requirements} />}
                <hr className="mt-6" />
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
