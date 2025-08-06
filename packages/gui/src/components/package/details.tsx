import { humanLicense, parseRepositoryScope, type KONBINI_MANIFEST } from "shared/types/manifest";
import Detail from "../detail";

export default function PackageDetails({
    app,
    manifestUrl,
}: {
    app: KONBINI_MANIFEST;
    manifestUrl: string;
}) {
    const repo = app.repository ? parseRepositoryScope(app.repository) : null;

    return (
        <>
            <h2 className="mt-12 mb-4 text-3xl text-white font-semibold">Package details</h2>
            <div className="flex flex-row gap-3 flex-wrap w-full">
                <Detail>
                    {app.privacy ? (
                        <svg
                            width="35"
                            height="35"
                            fill="none"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M10 2a4 4 0 0 1 4 4v2h2.5A1.5 1.5 0 0 1 18 9.5V11c-.319 0-.637.11-.896.329l-.107.1c-.812.845-1.656 1.238-2.597 1.238-.783 0-1.4.643-1.4 1.416v2.501c0 2.374.924 4.22 2.68 5.418L3.5 22A1.5 1.5 0 0 1 2 20.5v-11A1.5 1.5 0 0 1 3.5 8H6V6a4 4 0 0 1 4-4Zm8.284 10.122c.992 1.036 2.091 1.545 3.316 1.545.193 0 .355.143.392.332l.008.084v2.501c0 2.682-1.313 4.506-3.873 5.395a.385.385 0 0 1-.253 0c-2.476-.86-3.785-2.592-3.87-5.13L14 16.585v-2.5c0-.23.18-.417.4-.417 1.223 0 2.323-.51 3.318-1.545a.389.389 0 0 1 .566 0ZM10 13.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM10 4a2 2 0 0 0-2 2v2h4V6a2 2 0 0 0-2-2Z"
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
                                d="M12 2.001a4 4 0 0 1 3.771 2.666 1 1 0 0 1-1.84.774l-.045-.107a2 2 0 0 0-3.88.517L10.002 6v1.999h7.749a2.25 2.25 0 0 1 2.245 2.097l.005.154v9.496a2.25 2.25 0 0 1-2.096 2.245l-.154.005H6.25A2.25 2.25 0 0 1 4.005 19.9L4 19.746V10.25a2.25 2.25 0 0 1 2.096-2.245L6.25 8l1.751-.001v-2A3.999 3.999 0 0 1 12 2.002Zm0 11.498a1.499 1.499 0 1 0 0 2.998 1.499 1.499 0 0 0 0-2.998Z"
                                fill="#ffffff"
                            />
                        </svg>
                    )}
                    {app.privacy ? (
                        <div className="flex flex-col">
                            <a href={app.privacy} target="_blank" rel="noopener noreferrer">
                                Privacy Policy
                            </a>
                            <p className="text-xs font-light">{app.privacy}</p>
                        </div>
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
                            d="M17.75 2.007a2.25 2.25 0 0 1 2.245 2.096l.005.154v15.498A2.25 2.25 0 0 1 17.904 22l-.154.005H6.25a2.25 2.25 0 0 1-2.245-2.096L4 19.755V4.257a2.25 2.25 0 0 1 2.096-2.245l.154-.005h11.5ZM7.75 7a.75.75 0 1 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5ZM7 11.75c0 .414.336.75.75.75h8.5a.75.75 0 0 0 0-1.5h-8.5a.75.75 0 0 0-.75.75ZM7.75 15a.75.75 0 1 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z"
                            fill="#ffffff"
                        />
                    </svg>
                    {app.terms ? (
                        <div className="flex flex-col">
                            <a href={app.terms} target="_blank" rel="noopener noreferrer">
                                Terms of Use
                            </a>
                            <p className="text-xs font-light">{app.terms}</p>
                        </div>
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
                    {app.license ? (
                        <p>
                            Licensed under <b>{humanLicense(app.license)}</b>
                        </p>
                    ) : (
                        <p>No license specified</p>
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
                            d="M8.904 16.5h6.192C14.476 19.773 13.234 22 12 22c-1.197 0-2.4-2.094-3.038-5.204l-.058-.294h6.192-6.192Zm-5.838.001H7.37c.365 2.082.983 3.854 1.793 5.093a10.029 10.029 0 0 1-5.952-4.814l-.146-.279Zm13.563 0h4.305a10.028 10.028 0 0 1-6.097 5.093c.755-1.158 1.344-2.778 1.715-4.681l.076-.412h4.306-4.306Zm.302-6.5h4.87a10.055 10.055 0 0 1-.257 5H16.84a28.539 28.539 0 0 0 .13-4.344L16.93 10h4.87-4.87ZM2.198 10h4.87a28.211 28.211 0 0 0 .034 4.42l.057.58H2.456a10.047 10.047 0 0 1-.258-5Zm6.377 0h6.85a25.838 25.838 0 0 1-.037 4.425l-.062.575H8.674a25.979 25.979 0 0 1-.132-4.512L8.575 10h6.85-6.85Zm6.37-7.424-.109-.17A10.027 10.027 0 0 1 21.372 8.5H16.78c-.316-2.416-.956-4.492-1.837-5.923l-.108-.17.108.17Zm-5.903-.133.122-.037C8.283 3.757 7.628 5.736 7.28 8.06l-.061.44H2.628a10.028 10.028 0 0 1 6.414-6.057l.122-.037-.122.037ZM12 2.002c1.319 0 2.646 2.542 3.214 6.183l.047.315H8.739C9.28 4.691 10.643 2.002 12 2.002Z"
                            fill="#ffffff"
                        />
                    </svg>
                    {app.homepage ? (
                        <div className="flex flex-col">
                            <a href={app.homepage} target="_blank" rel="noopener noreferrer">
                                Package's website
                            </a>
                            <p className="text-xs font-light">{app.homepage}</p>
                        </div>
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
                        <div className="flex flex-col">
                            <a href={app.docs} target="_blank" rel="noopener noreferrer">
                                Learn to use it
                            </a>
                            <p className="text-xs font-light">{app.docs}</p>
                        </div>
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
                    {repo ? (
                        <div className="flex flex-col">
                            <a href={repo.public} target="_blank" rel="noopener noreferrer">
                                Open source code {":]"}
                            </a>
                            <p className="text-xs font-light">{repo.public}</p>
                        </div>
                    ) : (
                        <p className="font-normal">This package is closed source {":["}</p>
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
                            d="M12 2v6a2 2 0 0 0 2 2h6v10a2 2 0 0 1-2 2h-6.81A6.5 6.5 0 0 0 4 11.498V4a2 2 0 0 1 2-2h6Zm1.5.5V8a.5.5 0 0 0 .5.5h5.5l-6-6ZM6.5 23a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11Zm-1.146-7.646a.5.5 0 0 0-.708-.708l-2.5 2.5a.5.5 0 0 0 0 .708l2.5 2.5a.5.5 0 0 0 .708-.708L3.207 17.5l2.147-2.146Zm2.292-.708a.5.5 0 0 0 0 .708L9.793 17.5l-2.147 2.146a.5.5 0 0 0 .708.708l2.5-2.5a.5.5 0 0 0 0-.708l-2.5-2.5a.5.5 0 0 0-.708 0Z"
                            fill="#ffffff"
                        />
                    </svg>
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
