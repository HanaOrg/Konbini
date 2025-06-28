import Footer from "../components/footer";
import Nav from "../components/nav";

export function Safety() {
    return (
        <>
            <Nav />
            <div className="app-main-cont">
                <h1>Keeping Konbini apps safe</h1>
                <h4 className="text-xl font-medium text-[#ddd] mb-2">
                    Yet another package registry, without the "reputation" of it being managed by a
                    large scale corporation (like Microsoft or Canonical) can raise doubts about its
                    safety. This is what we do at Konbini to keep all uploads safe and sound.
                </h4>
                <p className="mb-6">
                    This only applies to <i>Konbini apps</i>. Aliased packages come from third-party
                    managers we don't control — and honestly, we don’t need to. If you’re unsure
                    about one, don’t use it! Konbini won’t install anything from unavailable
                    managers. Also, our current no-closed-source rule doesn’t cover aliased
                    packages; trusted closed-source apps like WhatsApp may appear via WinGet or
                    Snap.
                </p>
                <hr />
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">
                    Konbini apps require to be open-source
                </h2>
                <p>
                    As of now, only packages that are open source on GitHub (supporting other Git
                    platforms is open to consideration) can be published.
                    <br />
                    While it's true that we'd like to support closed-source packages and are working
                    on it &ndash; as most used apps sadly happen to be that way &ndash; we will not
                    do it until we have reliable enough methods to assert they're safe.
                </p>
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">
                    Konbini apps require to be hashed and digitally signed
                </h2>
                <p>
                    EVERY binary distributed directly through Konbini requires a SHA3-512 hash (
                    <i>Secure Hash Algorithm 3-512 bits</i>) and a PGP (<i>Pretty Good Privacy</i>)
                    digital signature. Hashes assert integrity and signatures assert authenticity.
                    Binaries are checked immediately after download, and if anything doesn't match,
                    they're immediately removed from your system and you get notified about the
                    incident, so that you can report the package to us as broken.
                </p>
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">
                    Konbini publishers are audited
                </h2>
                <p>
                    A random guy with no public repos who uploaded his code yesterday is less likely
                    to get his package accepted than someone with a "normal" developer history.
                    Since packages are managed via GitHub, we can run a small auditory over each
                    publisher before letting them in.
                </p>
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">
                    Konbini packages are constantly scanned
                </h2>
                <p>
                    "Don't trust, verify" &mdash;{" "}
                    <b>
                        we've setup our own local hardware to periodically fetch all binaries server
                        through Konbini and test them against antivirus software
                    </b>
                    . We use ClamAV, and a script that's open-source on Konbini's main repository.
                    All Konbini packages, even open source or verified ones must undergo this scan.
                </p>
            </div>
            <Footer />
        </>
    );
}
