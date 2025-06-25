import { useEffect, useState } from "preact/hooks";
import { getAgeRating, type KONBINI_MANIFEST } from "shared/types/manifest";
import { getPkgManifest } from "shared/api/core";
import Markdown from "react-markdown";
import { getDesktopPlatform } from "../ua";
import PlatformSupport from "../components/platform-support";
import Nav from "../components/nav";
import Footer from "../components/footer";

export default function PackagePage() {
    const [app, setApp] = useState<KONBINI_MANIFEST>();
    const [loading, setLoading] = useState<boolean>(true);
    const [slideIndex, setSlideIndex] = useState<number>(0);

    const route = window.location.pathname.split("/package/").filter(Boolean)[0];

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

    return (
        <>
            <Nav />
            <dialog id="install_dialog">
                <div className="flex">
                    <h2>Download {app.name} from Konbini</h2>
                    <button
                        onClick={() => {
                            const m = document.querySelector("#install_dialog");
                            if (!m) {
                                console.error("No modal rendered?");
                                return;
                            }
                            (m as HTMLDialogElement).close();
                        }}
                    >
                        <b>X</b>
                    </button>
                </div>
                <hr />
                <h3>Step one: Get Konbini</h3>
                <p>
                    On{" "}
                    {getDesktopPlatform().plat === "Windows" ? (
                        <b>a PowerShell session</b>
                    ) : (
                        <b>a BASH (or your system's shell) session</b>
                    )}
                    , run this script:
                    <br />
                    {getDesktopPlatform().plat === "Windows" ? (
                        <code>powershell -c "irm konbini.vercel.app/dl.ps1 | iex"</code>
                    ) : (
                        <code>curl -fsSL konbini.vercel.app/dl.sh | bash</code>
                    )}
                </p>
                <h3>Step two: Install this package</h3>
                <p>
                    Once Konbini installs, restart your terminal and run the following command:
                    <br />
                    <code>kbi install {route}</code>
                </p>
            </dialog>
            <div className="app-main-cont">
                <div className="flex">
                    <div className="left">
                        {app.icon && (
                            <img className="app-icon" src={app.icon} alt={`${app.name}'s icon.`} />
                        )}
                        <div className="label">
                            <h1 className="grad">{app.name}</h1>
                            <p>
                                By <b>{app.author_id}</b>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            const m = document.querySelector("#install_dialog");
                            if (!m) {
                                console.error("No modal rendered?");
                                return;
                            }
                            (m as HTMLDialogElement).showModal();
                        }}
                    >
                        Download
                    </button>
                </div>
                <h2>{app.slogan}</h2>
                <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
                    <div className={`age ${age}`}>
                        {age === "everyone"
                            ? "Everyone"
                            : age === "mid"
                              ? "May be inappropriate for kids"
                              : age === "high"
                                ? "Inappropriate for kids"
                                : "Inappropriate for young users"}
                    </div>
                    {app.age_rating.telemetry ? (
                        <div className="age high">Shares telemetry data</div>
                    ) : (
                        <></>
                    )}
                    ·
                    {isSupported ? (
                        <div className="badge supported">Works on your device</div>
                    ) : isPossiblySupported ? (
                        <div className="badge unsupported">Maybe works on your device</div>
                    ) : (
                        <div className="badge">Does not work on your device</div>
                    )}
                    ·
                    {app.categories.map((c) => (
                        <div className="badge">{c}</div>
                    ))}
                </div>
                <br />
                <hr />
                <div className="markdown">
                    <Markdown>{app.desc.replaceAll("\\n", "\n")}</Markdown>
                </div>
                {app.screenshot_urls && app.screenshot_urls.length > 0 ? (
                    <>
                        <hr />
                        <h2>Screenshots</h2>
                        <div className="slideshow-container">
                            {app.screenshot_urls.map((s, i) => (
                                <div
                                    className="slides"
                                    style={{
                                        display: i === slideIndex ? "block" : "none",
                                    }}
                                >
                                    <div className="numbertext">
                                        {i + 1 + "/" + app.screenshot_urls!.length}
                                    </div>
                                    <img src={s.link} alt={s.text} style={{ width: "100%" }} />
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
                ) : (
                    <></>
                )}
                <hr />
                <h2>Platform support</h2>
                <PlatformSupport platforms={app.platforms} />
                <h2>Details</h2>
                <div className="details">
                    <div className="detail">
                        <svg
                            width="50"
                            height="50"
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
                    </div>
                    <div className="detail">
                        <svg
                            width="50"
                            height="50"
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
                                Learn more at{" "}
                                <a href={app.homepage} target="_blank" rel="noopener noreferrer">
                                    {app.homepage}
                                </a>
                            </p>
                        ) : (
                            <p>
                                <i>The author of this package didn't specify a homepage.</i>
                            </p>
                        )}
                    </div>
                    <div className="detail">
                        <svg
                            width="50"
                            height="50"
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
                                Learn to use it at{" "}
                                <a href={app.docs} target="_blank" rel="noopener noreferrer">
                                    {app.docs}
                                </a>
                            </p>
                        ) : (
                            <p>
                                <i>
                                    The author of this package didn't specify a documentation site.
                                </i>
                            </p>
                        )}
                    </div>
                    <div className="detail">
                        {app.repository ? (
                            <svg
                                width="50"
                                height="50"
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
                                width="50"
                                height="50"
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
                                Find the source at{" "}
                                <a
                                    href={`https://github.com/${app.repository}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    github.com/<b>{app.repository}</b>
                                </a>
                            </p>
                        ) : (
                            <p>
                                <i>This package is closed source.</i>
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
