import Footer from "../components/footer";
import Nav from "../components/nav";

export default function Safety() {
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
                    managers we don't control. They're usually safe enough - and anyway Konbini
                    allows you to disable downloads from any aliased registry you don't trust.
                </p>
                <hr />
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">
                    Konbini runs on a public registry
                </h2>
                <p>
                    Whenever someone adds a package, their username and the exact manifest of their
                    package is public for anyone to view, and so is the source from where the
                    package is downloaded.
                    <br />
                    You can access this info by clicking on "Package manifest" from the "Package
                    details" section of each package.
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
                        we've setup an action runner to periodically test binaries served through
                        Konbini against antivirus software
                    </b>
                    . We run ClamAV through an open-source script on Konbini's main repository.
                    All Konbini packages, even if open source or verified, must and will undergo this scan.
                </p>
            </div>
            <Footer />
        </>
    );
}
