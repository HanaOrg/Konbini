import { useEffect, useState } from "preact/hooks";
import Nav from "../components/nav";
import Footer from "../components/footer";
import { type KONBINI_ID_USR } from "shared/types/author";
import PublisherDetails from "../components/package/publisher-details";
import { getAuthor } from "shared/api/kdata";
import type { KDATA_ENTRY_USR } from "shared/types/kdata";

export default function AuthorPage() {
    const [author, setAuthor] = useState<KDATA_ENTRY_USR>();
    const [loading, setLoading] = useState<boolean>(true);

    const route = window.location.pathname.split("/author/").filter(Boolean)[0]!;

    useEffect(() => {
        async function getAuthorAndApps() {
            try {
                const pkgAuthor = await getAuthor(route as KONBINI_ID_USR);
                setAuthor(pkgAuthor);
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
            <div className="bg-[var(--k)] w-128 h-128 blur-[300px] opacity-[0.6] absolute top-[-150px] right-[-150px] z-[-1]" />
            <div className="bg-[var(--k)] w-128 h-128 blur-[300px] opacity-[0.4] absolute bottom-[50px] right-[-300px] z-[-1]" />
            <Nav />
            <div className="app-main-cont">
                <h1 className="grad">{author.name}</h1>
                {author.biography && (
                    <p className="text-xl italic text-[#EEE] max-w-[60%]">{author.biography}</p>
                )}
                <PublisherDetails
                    authorId={route as KONBINI_ID_USR}
                    usr={author}
                    apps={author.packages}
                />
            </div>
            <Footer />
        </>
    );
}
