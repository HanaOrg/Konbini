import Footer from "../components/footer";
import Nav from "../components/nav";

export function Safety() {
    return (
        <>
            <Nav />
            <div className="app-main-cont">
                <h1>Keeping Konbini apps safe</h1>
                <h4>
                    Yet another package registry, without the "reputation" of it being managed by a
                    large scale corporation (like Microsoft or Canonical) can raise doubts about its
                    safety. This is what we do at Konbini to keep all uploads safe and sound.
                </h4>
                <p>
                    Be advised that this only refers to <i>Konbini apps per se</i>. Aliased packages
                    come from 3rd party, trustable enough package managers, which we cannot manage
                    and to be fair don't need to. If you're unsure about a package manager's overall
                    safety, just don't install it! Konbini won't install packages if they're aliased
                    to an unavailable manager. Also, keep in mind our claim of disallowing
                    closed-source software as of now does not apply to aliased packages.
                    Closed-source trusted software like WhatsApp is published to WinGet or
                    SnapCraft.
                </p>
                <hr />
                <h2>Konbini apps require to be open-source</h2>
                <p>
                    As of now, only packages that are open source on GitHub (supporting other Git
                    platforms is open to consideration) can be published.
                    <br />
                    While it's true that we'd like to support closed-source packages and are working
                    on it &ndash; as most used apps sadly happen to be that way &ndash; we will not
                    do it until we have reliable enough methods to assert they're safe.
                </p>
                <h2>Konbini apps require to be hashed and digitally signed</h2>
                <p>
                    EVERY binary distributed directly through Konbini requires a SHA3-512 hash (
                    <i>Secure Hash Algorithm 3-512 bits</i>) and a PGP (<i>Pretty Good Privacy</i>)
                    digital signature. Hashes assert integrity and signatures assert authenticity.
                    Binaries are checked immediately after download, and if anything doesn't match,
                    they're immediately removed from your system and you get notified about the
                    incident, so that you can report the package to us as broken.
                </p>
                <h2>Konbini publishers are audited</h2>
                <p>
                    A random guy with no public repos who uploaded his code yesterday is less likely
                    to get his package accepted than someone with a "normal" developer history.
                    Since packages are managed via GitHub, we can run a small auditory over each
                    publisher before letting them in.
                </p>
                <h2>Konbini packages are constantly scanned</h2>
                <p>
                    "Don't trust, verify" &mdash; trusting open source and doing all of the above is
                    already "enough". In the end, open source registries run on trust. However,
                    publishing clean code, then uploading a different binary to a release will
                    always be an option, which is why{" "}
                    <b>
                        we've setup our own local hardware to periodically fetch all binaries server
                        through Konbini and test them against antivirus software
                    </b>
                    . We use ClamAV, and a script that's open-source on Konbini's main repository.
                </p>
            </div>
            <Footer />
        </>
    );
}
