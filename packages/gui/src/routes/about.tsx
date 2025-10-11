import Footer from "../components/footer";
import Nav from "../components/nav";

export default function About() {
    return (
        <>
            <Nav />
            <div className="app-main-cont markdown">
                <h1>About Konbini</h1>
                <h4 className="text-xl font-medium text-[#ddd] mb-2"></h4>
                <hr />
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">What it is</h2>
                <p>
                    A universal package manager. It serves to you both its packages and the ones
                    from most other registries, like WinGet, Scoop, Homebrew, or Nix, to any
                    platform.
                </p>
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">Why Konbini</h2>
                <p>
                    <ul>
                        <b>It's safe.</b> Always-on antivirus scans, strong hashing and signing
                        requirements, and a public registry are what power the store.
                        <br />
                        <b>It's easy.</b> "<code>kbi install package-id</code>", that's how easy
                        installing apps should be (and it is, with Konbini).
                        <br />
                        <b>It's beautiful.</b> A nice website to browse packages and a good looking
                        CLI aren't too much to ask for, or at least that's what we think.
                        <br />
                        <b>It's dev-friendly.</b> Automated updates via repository releases, easy
                        3rd-party-package-manager aliasing, and a minimal yet sufficient toolchain
                        for publishing.
                        <br />
                        <b>It's free.</b> Free as in freedom, fully open source, auditable, with no
                        ads and no tracking.
                    </ul>
                </p>
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">How it works</h2>
                <p>
                    Under the hood it literally just runs other package managers for you when
                    aliasing, and works like a regular package manager when installing Konbini
                    packages.
                    <br />
                    It also automatically installs package managers under demand, so when a package
                    you want is only available from a source you don't have, there's no issue.
                    <br />
                    It's not rocket science. Being useful enough to look like it was unintended.
                </p>
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">What else?</h2>
                <p>
                    Nothing. It's a very simple thing, actually.
                    <br />
                    Yet, we're confident you'll find it really useful.
                </p>
            </div>
            <Footer />
        </>
    );
}
