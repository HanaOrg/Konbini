import Footer from "../components/footer";
import Nav from "../components/nav";

export default function Privacy() {
    return (
        <>
            <Nav />
            <div className="app-main-cont">
                <h1>Konbini's Privacy Policy</h1>
                <h4 className="text-xl font-medium text-[#ddd] mb-2">
                    We don't spy on you, promise.
                </h4>
                <p className="mb-6">
                    Seriously, we handle minimal data. We have this privacy policy because it's
                    legally required. <b>Last update: never.</b>
                </p>
                <hr />
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">
                    What data we may collect
                </h2>
                <h3 className="text-white text-xl font-semibold mb-2">From our website</h3>
                <p>
                    When you visit our main website (<a href="/">https://konbini.vercel.app/</a>),
                    Vercel Analytics collect anonymous data about user devices, browsers, and
                    countries. We do not have access to any personal data from this.
                </p>
                <h3 className="text-white text-xl font-semibold mb-2 mt-2">
                    From the Konbini application
                </h3>
                <p>
                    When you install or remove a package via Konbini, a request is sent to a data
                    endpoint hosted on Vercel. Vercel may log your IP address for rate limiting and
                    security (see their{" "}
                    <a
                        href="https://vercel.com/legal/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Privacy Policy
                    </a>
                    ). We do not store IPs. Our database only keeps anonymous records of the event
                    type (install or removal), operating system, country code, affected app, and
                    timestamp.
                </p>
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">
                    How we process this data
                </h2>
                <p>
                    Website analytics are handled and stored by Vercel only; we just use the
                    anonymous reports to monitor performance and may publish them anytime.
                    <br />
                    The install/removal data is stored by us in a Redis database hosted by{" "}
                    <a href="https://upstash.com" target="_blank" rel="noopener noreferrer">
                        Upstash
                    </a>
                    . The database is private but the anonymized statistics can be viewed publicly
                    on our site per app.
                </p>
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">
                    How to tell we're telling the truth
                </h2>
                <p>
                    Konbini is open source, so if you're curious you can check the source code to
                    see exactly what data is sent from the app.
                    <br />
                    Vercel Analytics isn't open source, but anyone can set it up for free. You can
                    create a test site, enable analytics, and visit it yourself to verify that no
                    sensitive data is ever sent to Vercel's dashboard.
                </p>
            </div>
            <Footer />
        </>
    );
}
