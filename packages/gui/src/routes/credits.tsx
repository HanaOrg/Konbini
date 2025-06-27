import Footer from "../components/footer";
import Nav from "../components/nav";

export function Credits() {
    return (
        <>
            <Nav />
            <div className="app-main-cont">
                <h1>Credits and acknowledgments</h1>
                <h4>
                    A honorable mention to the cool people at <a href="https://hanaorg.vercel.app">Hana</a> that maintain behind Konbini.
                </h4>
                <hr />
                <h2>This is our team</h2>
                <div className="maintainers">
                    <div className="maintainer">
                        <h3>Zaka</h3>
                        <p>Original maker.</p>
                    </div>
                    <div className="maintainer">
                        <h3>Pico</h3>
                        <p>Designer of the beautiful website you're on right now.</p>
                    </div>
                    </div>
            </div>
            <Footer />
        </>
    );
}
