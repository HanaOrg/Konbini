import Footer from "../components/footer";
import Nav from "../components/nav";

export default function Credits() {
    return (
        <>
            <Nav />
            <div className="app-main-cont">
                <h1 className="mb-6">Credits and acknowledgments</h1>
                <hr />
                <p className="mt-6 text-xl">
                    Created and developed almost entirely by{" "}
                    <a
                        href="http://zakahacecosas.github.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        ZakaHaceCosas
                    </a>{" "}
                    alone.
                    <br />
                    <br />
                    Huge thank you to{" "}
                    <a href="http://github.com/pico190" target="_blank" rel="noopener noreferrer">
                        Pico190
                    </a>{" "}
                    for helping a lot with this website's beautiful design.
                    <br />
                    Also thank you to{" "}
                    <a href="http://github.com/MrSerge01" target="_blank" rel="noopener noreferrer">
                        MrSerge01
                    </a>{" "}
                    and{" "}
                    <a href="http://github.com/dimkauzh" target="_blank" rel="noopener noreferrer">
                        dimkauzh
                    </a>{" "}
                    for helping out with testing, ideas, and other stuff.
                </p>
                <hr className="my-6" />
                <p className="text-xl mb-4">
                    Thanks to the following software, that powers Konbini:
                </p>
                <div className="flex flex-row w-full gap-2">
                    <div
                        onClick={() => (window.location.href = "https://vercel.com")}
                        className="cursor-pointer text-[#fff] font-bold text-2xl text-center p-4 w-full rounded-xl bg-[#000] hover:bg-[#222]"
                    >
                        Vercel
                    </div>
                    <div
                        onClick={() => (window.location.href = "https://upstash.com")}
                        className="cursor-pointer text-[#000] font-bold text-2xl text-center p-4 w-full rounded-xl bg-[#6ee7b7] hover:bg-[#499a7a]"
                    >
                        Upstash
                    </div>
                    <div
                        onClick={() => (window.location.href = "https://bun.sh")}
                        className="cursor-pointer text-[#000] font-bold text-2xl text-center p-4 w-full rounded-xl bg-[#f9f1e1] hover:bg-[#aca69b]"
                    >
                        BunJS
                    </div>
                    <div
                        onClick={() => (window.location.href = "https://www.clamav.net")}
                        className="cursor-pointer text-[#000] font-bold text-2xl text-center p-4 w-full rounded-xl bg-[#ef3e42] hover:bg-[#a22a2c]"
                    >
                        ClamAV
                    </div>
                    <div
                        onClick={() =>
                            (window.location.href = "https://github.com/features/actions")
                        }
                        className="cursor-pointer text-[#fff] font-bold text-2xl text-center p-4 w-full rounded-xl bg-[#000] hover:bg-[#222]"
                    >
                        GitHub Actions
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
