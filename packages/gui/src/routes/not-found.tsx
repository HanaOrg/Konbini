import Footer from "../components/footer";
import Nav from "../components/nav";

export function NotFound() {
    return (
        <>
            <Nav />
            <div className="app-main-cont">
                <h1>Got lost through the store?</h1>
                <p>
                    We couldn't find the requested route. <a href="/">Go home.</a>
                </p>
            </div>
            <Footer />
        </>
    );
}
