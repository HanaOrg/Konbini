import { useEffect, useState } from "preact/hooks";
import { getUsrManifest } from "shared/api/core";
import Nav from "../components/nav";
import Footer from "../components/footer";
import { type KONBINI_AUTHOR, type KONBINI_ID_USR } from "shared/types/author";
import PublisherDetails from "../components/package/publisher-details";
import { retrieveAllApps, type MANIFEST_WITH_ID } from "./home";

export default function AuthorPage() {
    const [author, setAuthor] = useState<KONBINI_AUTHOR>();
    const [apps, setApps] = useState<MANIFEST_WITH_ID[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const route = window.location.pathname.split("/author/").filter(Boolean)[0]!;

    useEffect(() => {
        async function getAuthorAndApps() {
            try {
                const pkgAuthor = await getUsrManifest(route);
                setAuthor(pkgAuthor);
                const apps = await retrieveAllApps();
                const filtered = apps.filter((a) => a.author == route);
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
                {author.biography && (
                    <p className="text-xl italic opacity-[0.9] text-[#FFF]">{author.biography}</p>
                )}
                <PublisherDetails authorId={route as KONBINI_ID_USR} usr={author} apps={apps} />
            </div>
            <Footer />
        </>
    );
}
