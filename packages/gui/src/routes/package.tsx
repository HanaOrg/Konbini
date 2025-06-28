import { useEffect, useState } from "preact/hooks";
import { getAgeRating, parseOsVer, type KONBINI_MANIFEST } from "shared/types/manifest";
import { getPkgManifest, locatePkg } from "shared/api/core";
import Markdown from "react-markdown";
import { getDesktopPlatform } from "../ua";
import PlatformSupport from "../components/platform-support";
import Nav from "../components/nav";
import Footer from "../components/footer";
import InstallDialog from "../components/install-dialog";
import Badge from "../components/badge";
import { toUpperCaseFirst } from "@zakahacecosas/string-utils";
import Detail from "../components/detail";

export default function PackagePage() {
    const [app, setApp] = useState<KONBINI_MANIFEST>();
    const [loading, setLoading] = useState<boolean>(true);
    const [slideIndex, setSlideIndex] = useState<number>(0);

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
                setApp(manifest);
                setLoading(false);
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

    if (!app && loading) return <h1>Loading package "{route}"...</h1>;
    if (!app) return <h1>Error loading {route}</h1>;

    const plat = getDesktopPlatform();

    const isSupported =
        (plat.plat == "Windows" && app.platforms.win64) ||
        (plat.plat == "macOS" && plat.arch == "64" && app.platforms.mac64) ||
        (plat.plat == "macOS" && plat.arch == "ARM" && app.platforms.macARM) ||
        (plat.plat == "Linux" && plat.arch == "64" && app.platforms.linux64) ||
        (plat.plat == "Linux" && plat.arch == "ARM" && app.platforms.linuxARM);
    /** for when we don't know the arch but know the OS */
    const isPossiblySupported =
        (plat.plat == "macOS" && (app.platforms.mac64 || app.platforms.macARM)) ||
        (plat.plat == "Linux" && (app.platforms.linux64 || app.platforms.linuxARM));

    const supportString = isSupported
        ? "Works on your device"
        : isPossiblySupported
          ? "Maybe works on your device"
          : "Does not work on your device";
    const supportColor = isSupported ? "#FFC3C4" : isPossiblySupported ? "#FF7C65" : "#FF3863";
    const age = getAgeRating(app.age_rating);

    function moveSlideIndex(n: number) {
        if (!app || !app.screenshot_urls) return;
        console.debug("passed", n, "len", app.screenshot_urls.length, "index", slideIndex);
        if (n < 0) {
            console.debug("should reset FWD");
            setSlideIndex(app.screenshot_urls.length - 1);
            return;
        }
        if (n > app.screenshot_urls.length - 1) {
            console.debug("should reset BWD");
            setSlideIndex(0);
            return;
        }
        console.debug("should behave");
        setSlideIndex(n);
        return;
    }

    const osVer =
        app.sys_requirements && app.sys_requirements.os_ver
            ? parseOsVer(app.sys_requirements.os_ver)
            : null;

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
                        <Badge text={`By ${app.author_id}`} color="#ffffff1a" />
                        <div className="flex flex-row gap-1 mt-2">
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
                                        ? "Everyone"
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
                <div className="markdown">
                    <Markdown>{app.desc.replaceAll("\\n", "\n")}</Markdown>
                </div>
                {app.screenshot_urls && app.screenshot_urls.length > 0 && (
                    <>
                        <h2 className="mt-12 mb-4 text-3xl text-white font-semibold">
                            Screenshots
                        </h2>
                        <div className="slideshow-container">
                            {app.screenshot_urls.map((s, i) => (
                                <div
                                    className="slides"
                                    style={{
                                        display: i === slideIndex ? "flex" : "none",
                                    }}
                                >
                                    <div className="number-text">
                                        {i + 1 + "/" + app.screenshot_urls!.length}
                                    </div>
                                    <img src={s.link} alt={s.text} />
                                    <div className="text">{s.text}</div>
                                </div>
                            ))}

                            <a className="prev" onClick={() => moveSlideIndex(slideIndex - 1)}>
                                &#10094;
                            </a>
                            <a className="next" onClick={() => moveSlideIndex(slideIndex + 1)}>
                                &#10095;
                            </a>
                        </div>

                        <div style={{ textAlign: "center" }}>
                            {app.screenshot_urls.map((_, i) => (
                                <span
                                    className={i == slideIndex ? "dot active" : "dot"}
                                    onClick={() => moveSlideIndex(i)}
                                ></span>
                            ))}
                        </div>
                    </>
                )}
                <h2 className="mt-12 mb-4 text-3xl text-white font-semibold">Platform support</h2>
                <PlatformSupport platforms={app.platforms} />
                <h2 className="mt-12  mb-4 text-3xl text-white font-semibold">Package details</h2>
                <div className="flex flex-row gap-3 flex-wrap">
                    <Detail>
                        <svg
                            width="35"
                            height="35"
                            fill="none"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M3.75 3a.75.75 0 0 0 0 1.5h1.042l-2.737 6.717A.75.75 0 0 0 2 11.5a3.5 3.5 0 1 0 7 0 .75.75 0 0 0-.055-.283L6.208 4.5h5.042v12H7.253a2.25 2.25 0 0 0 0 4.5h9.497a2.25 2.25 0 0 0 0-4.5h-4v-12h5.042l-2.737 6.717A.75.75 0 0 0 15 11.5a3.5 3.5 0 1 0 7 0 .75.75 0 0 0-.055-.283L19.208 4.5h1.042a.75.75 0 0 0 0-1.5H3.75ZM5.5 6.738l1.635 4.012h-3.27L5.5 6.738Zm11.365 4.012L18.5 6.738l1.635 4.012h-3.27Z"
                                fill="#ffffff"
                            />
                        </svg>
                        {app.privacy ? (
                            <p>
                                <a href={app.privacy} target="_blank" rel="noopener noreferrer">
                                    Privacy Policy
                                </a>
                                <p className="text-xs font-light">{app.privacy}</p>
                            </p>
                        ) : (
                            <p className="font-normal">No Privacy Policy provided.</p>
                        )}
                    </Detail>
                    <Detail>
                        <svg
                            width="35"
                            height="35"
                            fill="none"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M3.75 3a.75.75 0 0 0 0 1.5h1.042l-2.737 6.717A.75.75 0 0 0 2 11.5a3.5 3.5 0 1 0 7 0 .75.75 0 0 0-.055-.283L6.208 4.5h5.042v12H7.253a2.25 2.25 0 0 0 0 4.5h9.497a2.25 2.25 0 0 0 0-4.5h-4v-12h5.042l-2.737 6.717A.75.75 0 0 0 15 11.5a3.5 3.5 0 1 0 7 0 .75.75 0 0 0-.055-.283L19.208 4.5h1.042a.75.75 0 0 0 0-1.5H3.75ZM5.5 6.738l1.635 4.012h-3.27L5.5 6.738Zm11.365 4.012L18.5 6.738l1.635 4.012h-3.27Z"
                                fill="#ffffff"
                            />
                        </svg>
                        {app.terms ? (
                            <p>
                                <a href={app.terms} target="_blank" rel="noopener noreferrer">
                                    Terms of Use
                                </a>
                                <p className="text-xs font-light">{app.terms}</p>
                            </p>
                        ) : (
                            <p className="font-normal">No Terms of Use provided.</p>
                        )}
                    </Detail>
                    <Detail>
                        <svg
                            width="35"
                            height="35"
                            fill="none"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M3.75 3a.75.75 0 0 0 0 1.5h1.042l-2.737 6.717A.75.75 0 0 0 2 11.5a3.5 3.5 0 1 0 7 0 .75.75 0 0 0-.055-.283L6.208 4.5h5.042v12H7.253a2.25 2.25 0 0 0 0 4.5h9.497a2.25 2.25 0 0 0 0-4.5h-4v-12h5.042l-2.737 6.717A.75.75 0 0 0 15 11.5a3.5 3.5 0 1 0 7 0 .75.75 0 0 0-.055-.283L19.208 4.5h1.042a.75.75 0 0 0 0-1.5H3.75ZM5.5 6.738l1.635 4.012h-3.27L5.5 6.738Zm11.365 4.012L18.5 6.738l1.635 4.012h-3.27Z"
                                fill="#ffffff"
                            />
                        </svg>
                        <p>
                            Licensed under <b>{app.license}</b>
                        </p>
                    </Detail>
                    <Detail>
                        <svg
                            width="35"
                            height="35"
                            fill="none"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M8.904 16.5h6.192C14.476 19.773 13.234 22 12 22c-1.197 0-2.4-2.094-3.038-5.204l-.058-.294h6.192-6.192Zm-5.838.001H7.37c.365 2.082.983 3.854 1.793 5.093a10.029 10.029 0 0 1-5.952-4.814l-.146-.279Zm13.563 0h4.305a10.028 10.028 0 0 1-6.097 5.093c.755-1.158 1.344-2.778 1.715-4.681l.076-.412h4.306-4.306Zm.302-6.5h4.87a10.055 10.055 0 0 1-.257 5H16.84a28.539 28.539 0 0 0 .13-4.344L16.93 10h4.87-4.87ZM2.198 10h4.87a28.211 28.211 0 0 0 .034 4.42l.057.58H2.456a10.047 10.047 0 0 1-.258-5Zm6.377 0h6.85a25.838 25.838 0 0 1-.037 4.425l-.062.575H8.674a25.979 25.979 0 0 1-.132-4.512L8.575 10h6.85-6.85Zm6.37-7.424-.109-.17A10.027 10.027 0 0 1 21.372 8.5H16.78c-.316-2.416-.956-4.492-1.837-5.923l-.108-.17.108.17Zm-5.903-.133.122-.037C8.283 3.757 7.628 5.736 7.28 8.06l-.061.44H2.628a10.028 10.028 0 0 1 6.414-6.057l.122-.037-.122.037ZM12 2.002c1.319 0 2.646 2.542 3.214 6.183l.047.315H8.739C9.28 4.691 10.643 2.002 12 2.002Z"
                                fill="#ffffff"
                            />
                        </svg>
                        {app.homepage ? (
                            <p>
                                <a href={app.homepage} target="_blank" rel="noopener noreferrer">
                                    Learn more
                                </a>
                                <p className="text-xs font-light">{app.homepage}</p>
                            </p>
                        ) : (
                            <p className="font-normal">
                                The author of this package didn't specify a homepage.
                            </p>
                        )}
                    </Detail>
                    <Detail>
                        <svg
                            width="35"
                            height="35"
                            fill="none"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 2v6a2 2 0 0 0 2 2h6v10.5a1.5 1.5 0 0 1-1.5 1.5H13v-8a2 2 0 0 0-2-2H4V3.5A1.5 1.5 0 0 1 5.5 2H12Z"
                                fill="#ffffff"
                            />
                            <path
                                d="M13.5 2.5V8a.5.5 0 0 0 .5.5h5.5l-6-6ZM7.25 17.5a.75.75 0 0 0-1.5 0V21a.75.75 0 0 0 1.5 0v-3.5ZM7.25 15.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM4.5 13.75a.75.75 0 0 1-.75.75H2.5v7h1.25a.75.75 0 0 1 0 1.5H2.5A1.5 1.5 0 0 1 1 21.5v-7A1.5 1.5 0 0 1 2.5 13h1.25a.75.75 0 0 1 .75.75ZM9.25 14.5a.75.75 0 0 1 0-1.5h1.25a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H9.25a.75.75 0 0 1 0-1.5h1.25v-7H9.25Z"
                                fill="#ffffff"
                            />
                        </svg>
                        {app.docs ? (
                            <p>
                                <a href={app.docs} target="_blank" rel="noopener noreferrer">
                                    Learn to use it
                                </a>
                                <p className="text-xs font-light">{app.docs}</p>
                            </p>
                        ) : (
                            <p className="font-normal">
                                The author of this package didn't specify a documentation site.
                            </p>
                        )}
                    </Detail>
                    <Detail>
                        {app.repository ? (
                            <svg
                                width="35"
                                height="35"
                                fill="none"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="m8.086 18.611 5.996-14.004a1 1 0 0 1 1.878.677l-.04.11-5.996 14.004a1 1 0 0 1-1.878-.677l.04-.11 5.996-14.004L8.086 18.61Zm-5.793-7.318 4-4a1 1 0 0 1 1.497 1.32l-.083.094L4.414 12l3.293 3.293a1 1 0 0 1-1.32 1.498l-.094-.084-4-4a1 1 0 0 1-.083-1.32l.083-.094 4-4-4 4Zm14-4.001a1 1 0 0 1 1.32-.083l.093.083 4.001 4.001a1 1 0 0 1 .083 1.32l-.083.095-4.001 3.995a1 1 0 0 1-1.497-1.32l.084-.095L19.584 12l-3.293-3.294a1 1 0 0 1 0-1.414Z"
                                    fill="#ffffff"
                                />
                            </svg>
                        ) : (
                            <svg
                                width="35"
                                height="35"
                                fill="none"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M12 4C9.238 4 7 6.238 7 9a1 1 0 0 0 2 0c0-1.658 1.342-3 3-3s3 1.342 3 3c0 .816-.199 1.294-.438 1.629-.262.365-.625.638-1.128.985l-.116.078c-.447.306-1.023.699-1.469 1.247-.527.648-.849 1.467-.849 2.561v.5a1 1 0 1 0 2 0v-.5c0-.656.178-1.024.4-1.299.257-.314.603-.552 1.114-.903l.053-.037c.496-.34 1.133-.786 1.62-1.468C16.7 11.081 17 10.183 17 9c0-2.762-2.238-5-5-5ZM12 21.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"
                                    fill="#ffffff"
                                />
                            </svg>
                        )}
                        {app.repository ? (
                            <p>
                                <a
                                    href={`https://github.com/${app.repository}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Open source code :)
                                </a>
                                <p className="text-xs font-light">{`https://github.com/${app.repository}`}</p>
                            </p>
                        ) : (
                            <p className="font-normal">This package is closed source :(</p>
                        )}
                    </Detail>
                    <Detail>
                        <svg
                            width="35"
                            height="35"
                            fill="none"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="m8.086 18.611 5.996-14.004a1 1 0 0 1 1.878.677l-.04.11-5.996 14.004a1 1 0 0 1-1.878-.677l.04-.11 5.996-14.004L8.086 18.61Zm-5.793-7.318 4-4a1 1 0 0 1 1.497 1.32l-.083.094L4.414 12l3.293 3.293a1 1 0 0 1-1.32 1.498l-.094-.084-4-4a1 1 0 0 1-.083-1.32l.083-.094 4-4-4 4Zm14-4.001a1 1 0 0 1 1.32-.083l.093.083 4.001 4.001a1 1 0 0 1 .083 1.32l-.083.095-4.001 3.995a1 1 0 0 1-1.497-1.32l.084-.095L19.584 12l-3.293-3.294a1 1 0 0 1 0-1.414Z"
                                fill="#ffffff"
                            />
                        </svg>
                        <p>
                            <a href={manifestUrl} target="_blank" rel="noopener noreferrer">
                                {app.name}'s Konbini manifest
                            </a>
                            <p className="text-xs font-light">
                                {manifestUrl
                                    .replace("https://github.com/HanaOrg/", "")
                                    .replace("blob/main/", "")}
                            </p>
                        </p>
                    </Detail>
                </div>
                {app.sys_requirements && (
                    <>
                        <h2 className="mt-12 mb-4 text-3xl text-white font-semibold">
                            System requirements
                        </h2>
                        <div className="flex flex-row gap-12">
                            {app.sys_requirements.os_ver &&
                                osVer &&
                                osVer !== "Invalid OS requirements." && (
                                    <div className="flex flex-col gap-1">
                                        <b className="mb-2">OS</b>
                                        {osVer.win && (
                                            <p>
                                                <b>Windows</b> | {osVer.win}
                                            </p>
                                        )}
                                        {osVer.mac && (
                                            <p>
                                                <b>macOS</b> | {osVer.mac}
                                            </p>
                                        )}
                                        {osVer.lin && (
                                            <p>
                                                <b>Linux</b> | {osVer.lin}
                                            </p>
                                        )}
                                    </div>
                                )}
                            {app.sys_requirements.ram_mb && (
                                <div className="flex flex-col gap-1">
                                    <b className="mb-2">RAM</b>
                                    {app.sys_requirements.ram_mb} MB
                                </div>
                            )}
                            {app.sys_requirements.disk_mb && (
                                <div className="flex flex-col gap-1">
                                    <b className="mb-2">Storage</b>
                                    {app.sys_requirements.disk_mb} MB
                                </div>
                            )}
                        </div>
                    </>
                )}
                {app.maintainers && (
                    <>
                        <h2 className="mt-12  text-3xl text-white font-semibold">
                            Maintainers of this package
                        </h2>
                        <p className="mb-4">besides {app.author_id}</p>
                        <div className="flex flex-row gap-4">
                            {app.maintainers.map((m) => (
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-xl text-white">{m.name}</h3>
                                    {m.email && <a href={`mailto:${m.email}`}>{m.email}</a>}
                                    {m.github && (
                                        <a
                                            href={`https://github.com/${m.github}`}
                                            rel="noopener noreferrer"
                                            target="_blank"
                                        >
                                            {m.github} on GitHub
                                        </a>
                                    )}
                                    {m.link && (
                                        <a href={m.link} rel="noopener noreferrer" target="_blank">
                                            {m.link}
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
            <Footer />
        </>
    );
}
