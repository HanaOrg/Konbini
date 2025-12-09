import {
    PiArticleFill,
    PiBookBookmarkFill,
    PiCodeFill,
    PiFileFill,
    PiGlobeFill,
    PiHardDriveFill,
    PiLockFill,
    PiProhibitInsetFill,
    PiScalesFill,
} from "react-icons/pi";
import { humanLicense, parseRepositoryScope } from "shared/types/manifest";
import Detail from "../detail";
import type { KDATA_ENTRY_PKG } from "shared/types/kdata";
import { getDesktopPlatform } from "../../ua";

export default function PackageDetails({
    app,
    manifestUrl,
}: {
    app: KDATA_ENTRY_PKG;
    manifestUrl: string;
}) {
    const repo = app.repository
        ? app.repository.startsWith("url:")
            ? {
                  public: app.repository.slice(4),
              }
            : parseRepositoryScope(app.repository)
        : null;
    const _p = getDesktopPlatform();
    const platform =
        _p.plat === "Windows" && _p.arch === "64"
            ? "win64"
            : _p.plat === "Linux"
              ? _p.arch === "64"
                  ? "linux64"
                  : _p.arch === "ARM"
                    ? "linuxArm"
                    : null
              : _p.plat === "macOS"
                ? _p.arch === "ARM"
                    ? "macArm"
                    : _p.arch === "64"
                      ? "mac64"
                      : null
                : null;
    const appSize = platform ? (app.filesizes ? (app.filesizes[platform] ?? null) : null) : null;

    return (
        <>
            <h2 className="mt-12 mb-4 text-3xl text-white font-semibold">Package details</h2>
            <div className="flex flex-row gap-3 flex-wrap w-full">
                {appSize && (
                    <Detail>
                        <PiHardDriveFill size={35} />
                        <p>Takes {(appSize / 1048576).toFixed(2)} MB.</p>
                    </Detail>
                )}

                {app.privacy && (
                    <Detail>
                        <PiLockFill size={35} />
                        <div className="flex flex-col">
                            <a href={app.privacy} target="_blank" rel="noopener noreferrer">
                                Privacy Policy
                            </a>
                            <p className="text-xs font-light">{app.privacy}</p>
                        </div>
                    </Detail>
                )}
                {app.terms && (
                    <Detail>
                        <PiArticleFill size={35} />

                        <div className="flex flex-col">
                            <a href={app.terms} target="_blank" rel="noopener noreferrer">
                                Terms of Use
                            </a>
                            <p className="text-xs font-light">{app.terms}</p>
                        </div>
                    </Detail>
                )}
                <Detail>
                    <PiScalesFill size={35} />
                    {app.license ? (
                        <p>
                            Licensed under <i>{humanLicense(app.license)}</i>
                        </p>
                    ) : (
                        <p>No license.</p>
                    )}
                </Detail>
                {app.homepage && (
                    <Detail>
                        <PiGlobeFill size={35} />

                        <div className="flex flex-col">
                            <a href={app.homepage} target="_blank" rel="noopener noreferrer">
                                Package's website
                            </a>
                            <p className="text-xs font-light">{app.homepage}</p>
                        </div>
                    </Detail>
                )}
                {app.docs && (
                    <Detail>
                        <PiBookBookmarkFill size={35} />
                        <div className="flex flex-col">
                            <a href={app.docs} target="_blank" rel="noopener noreferrer">
                                Learn to use it
                            </a>
                            <p className="text-xs font-light">{app.docs}</p>
                        </div>
                    </Detail>
                )}
                <Detail>
                    {repo ? <PiCodeFill size={35} /> : <PiProhibitInsetFill size={35} />}
                    {repo ? (
                        <div className="flex flex-col">
                            <a href={repo.public} target="_blank" rel="noopener noreferrer">
                                Open source code {":]"}
                            </a>
                            <p className="text-xs font-light">{repo.public}</p>
                        </div>
                    ) : (
                        <p className="font-normal">Closed source {":["}</p>
                    )}
                </Detail>
                <Detail>
                    <PiFileFill size={35} />
                    <div className="flex flex-col">
                        <a href={manifestUrl} target="_blank" rel="noopener noreferrer">
                            Project manifest
                        </a>
                        <p className="text-xs font-light">
                            {manifestUrl
                                .replace("https://github.com/HanaOrg/", "")
                                .replace("blob/main/", "")}
                        </p>
                    </div>
                </Detail>
            </div>
        </>
    );
}
