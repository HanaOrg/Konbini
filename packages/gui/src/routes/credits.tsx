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
                    Created and developed entirely by{" "}
                    <a
                        href="http://zakahacecosas.github.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        ZakaHaceCosas
                    </a>
                    .<br />
                    Thank you to{" "}
                    <a href="http://github.com/pico190" target="_blank" rel="noopener noreferrer">
                        Pico190
                    </a>{" "}
                    for helping A LOT with this website's beautiful design.
                </p>
                <hr className="my-6" />
                <p className="text-xl">
                    Powered by the following software:
                    <div className="flex flex-row w-full gap-4">
                        <div
                            onClick={() => (window.location.href = "https://vercel.com")}
                            className="cursor-pointer text-[#fff] font-bold text-2xl text-center p-4 w-full rounded-xl bg-[#000]"
                        >
                            Vercel
                        </div>
                        <div
                            onClick={() => (window.location.href = "https://upstash.com")}
                            className="cursor-pointer text-[#000] font-bold text-2xl text-center p-4 w-full rounded-xl bg-[#6ee7b7]"
                        >
                            Upstash
                        </div>
                        <div
                            onClick={() => (window.location.href = "https://bun.sh")}
                            className="cursor-pointer text-[#000] font-bold text-2xl text-center p-4 w-full rounded-xl bg-[#f9f1e1]"
                        >
                            BunJS
                        </div>
                        <div
                            onClick={() => (window.location.href = "https://www.clamav.net")}
                            className="cursor-pointer text-[#000] font-bold text-2xl text-center p-4 w-full rounded-xl bg-[#ef3e42]"
                        >
                            ClamAV
                        </div>
                    </div>
                </p>
            </div>
            <Footer />
        </>
    );
}
