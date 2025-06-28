import Footer from "../components/footer";
import Nav from "../components/nav";

export function Credits() {
    return (
        <>
            <Nav />
            <div className="app-main-cont">
                <h1 className="mb-6">Credits and acknowledgments</h1>
                <hr />
                <h2 className="mt-6 text-lg">
                    Creation and main development by{" "}
                    <a
                        href="http://zakahacecosas.github.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Zaka
                    </a>
                    .<br />
                    Website's beautiful designing by{" "}
                    <a href="http://github.com/pico190" target="_blank" rel="noopener noreferrer">
                        Pico
                    </a>
                    .
                </h2>
            </div>
            <Footer />
        </>
    );
}
