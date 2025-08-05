import { useEffect, useState } from "preact/hooks";
import { getUsrManifest, locateUsr } from "shared/api/core";
import Nav from "../components/nav";
import Footer from "../components/footer";
import { type KONBINI_AUTHOR, type KONBINI_AUTHOR_ID } from "shared/types/author";
import PublisherDetails from "../components/package/publisher-details";
import { retrieveAllApps, type MANIFEST_WITH_ID } from "./home";
import Detail from "../components/detail";

export default function AuthorPage() {
    const [author, setAuthor] = useState<KONBINI_AUTHOR>();
    const [apps, setApps] = useState<MANIFEST_WITH_ID[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const route = window.location.pathname.split("/author/").filter(Boolean)[0]!;
    const manifestUrl =
        locateUsr(route).replace("raw.githubusercontent", "github").replace("main", "blob/main") +
        "/" +
        route +
        ".yaml";

    useEffect(() => {
        async function getAuthorAndApps() {
            try {
                const pkgAuthor = await getUsrManifest(route);
                setAuthor(pkgAuthor);
                const apps = await retrieveAllApps();
                const filtered = apps.filter((a) => a.author_id == route);
                setApps(filtered);
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
        getAuthorAndApps();
    }, []);

    if (!author && loading)
        return (
            <>
                <div className="bg-[#8800FF] w-128 h-128 blur-[300px] opacity-[0.75] absolute top-[650px] left-[-50px] z-[-1]" />
                <div className="bg-[#FF07EA] w-128 h-128 blur-[300px] opacity-[0.65] absolute bottom-[50px] right-[-300px] z-[-1]" />
                <div className="bg-[#C23282] w-128 h-128 blur-[300px] opacity-[0.50] absolute top-[-150px] right-[-150px] z-[-1]" />
                <h1>Loading author "{route}"...</h1>
            </>
        );
    if (!author) return <h1>Error loading {route}. Failed to load author data.</h1>;

    return (
        <>
            <div className="bg-[#8800FF] w-128 h-128 blur-[300px] opacity-[0.75] absolute top-[650px] left-[-50px] z-[-1]" />
            <div className="bg-[#FF07EA] w-128 h-128 blur-[300px] opacity-[0.65] absolute bottom-[50px] right-[-300px] z-[-1]" />
            <div className="bg-[#C23282] w-128 h-128 blur-[300px] opacity-[0.50] absolute top-[-150px] right-[-150px] z-[-1]" />
            <Nav />
            <div className="app-main-cont">
                <h1 className="grad">{author.name}</h1>
                <PublisherDetails authorId={route as KONBINI_AUTHOR_ID} usr={author} apps={apps} />

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
                            Author manifest
                        </a>
                        <p className="text-xs font-light">
                            {manifestUrl
                                .replace("https://github.com/HanaOrg/", "")
                                .replace("blob/main/", "")}
                        </p>
                    </div>
                </Detail>
            </div>
            <Footer />
        </>
    );
}
