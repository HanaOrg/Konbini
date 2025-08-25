import Footer from "../components/footer";
import Nav from "../components/nav";

export default function Terms() {
    return (
        <>
            <Nav />
            <div className="app-main-cont markdown">
                <h1>Konbini's Terms of Service</h1>
                <h4 className="text-xl font-medium text-[#ddd] mb-2">
                    A small set of rules we enforce for Konbini to stay cool and clean.
                </h4>
                <p className="mb-6">
                    This is legal text. <b>Last update: never.</b>
                </p>
                <hr />{" "}
                <div className="bg-[#FFCF574D] flex flex-col gap-2 p-4 rounded-xl border-2 border-[#FFFFFF33]">
                    <h3 className="text-xl font-semibold text-[#FFCC96]">
                        Do not (yet) take this into consideration.
                    </h3>
                    <hr />
                    <p className="text-lg font-medium text-[#FFCC96]">
                        Konbini is still a work in progress project, this document is a draft and
                        may be changed at any time to fix issues with it or even entirely modify it.
                    </p>
                </div>
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">
                    Terms and Definitions
                </h2>
                <p>
                    Through these Terms of Service (later referred to as "Terms"), The Konbini team
                    will be referred to as "we", "us", "our/ours", or "Hana" (as in "The Hana
                    Organization").The Privacy Policy of Konbini can be found at
                    https://konbini.vercel.app/privacy. Throughout the Terms, we comply with our
                    legal obligations. By using Konbini you hereby agree to these Terms.
                    <br />
                    <br />
                    Throughout these Terms, the following definitions apply:
                    <br />
                    <br />
                    <ul>
                        <li>
                            <b>"You"</b> will refer to you as an individual and a user of Konbini.
                        </li>
                        <li>
                            <b>"Package"</b> will refer to an application, package, tool, or
                            similar, that you may (attempt to) contribute to Konbini, making it
                            available for everyone to download.
                        </li>
                        <li>
                            <b>"Konbini Guard"</b> will refer to the set of tools and automations we
                            scan and audit all uploaded packages with, to guarantee antivirus safety
                            and package integrity.
                        </li>
                    </ul>
                </p>
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">Governing Law</h2>
                <p>
                    Throughout these Terms, whenever we reference the <i>law</i>, we will be
                    referring to both the law of your country of legal residence, and the law of the
                    Kingdom of Spain (<i>our</i> country of residence).
                    <br />
                    <br />
                    If your law and our law happen to disagree, Spanish law will always prevail.
                </p>
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">
                    About Published Packages
                </h2>
                <p>
                    Whenever you begin the process to serve a "package" through Konbini (by
                    contributing its manifest to our code repository), you are giving us certain
                    rights:
                </p>
                <ul className="my-3">
                    <li>
                        The right to reject a submission for any reason. You will always be
                        explained the reason in detail.
                    </li>
                    <li>
                        The right to edit, alter, add, or remove information from its public
                        manifest, both in the moment of the submission and any time after.
                    </li>
                    <li>
                        The right to remove the package from public listing at any time, as long as
                        it is for any of the following "valid" reasons:
                        <ul>
                            <li>
                                Complying with a request from any legal or governmental authority.
                            </li>
                            <li>
                                Complying with our safety promise, in the event of your package
                                being flagged as unsafe by Konbini Guard.
                            </li>
                            <li>
                                Complying with our own Terms of Service. If your package is found
                                anytime to not be in compliance with our ToS, it will be removed
                                without prior notification.
                            </li>
                        </ul>
                    </li>
                    <li>
                        The right to use your package's name, icon if provided, and public page, in
                        any of our advertising.
                    </li>
                </ul>
                <p>
                    If you happen to disagree with any decision we may take <i>against</i> you, you
                    always have the right to appeal it by directly talking to anyone publicly
                    labeled as a member of Hana. The right to appeal our decisions is provided as a
                    courtesy, and we hold no obligation to lift any action we may have previously
                    taken.
                </p>
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">
                    Rules to comply with when publishing a Package
                </h2>
                <p>
                    To ensure everyone can benefit from a fair, safe, and clean market, we enforce a
                    small set of rules that all packages have to comply with in order to be allowed
                    in Konbini.
                    <ul className="my-3">
                        <li>
                            Your package must not engage with any activity that is against the law.
                        </li>
                        <li>
                            Your package must not violate the copyrights of any individual or
                            organization.
                        </li>
                        <li>
                            Your package must not contain any sexual or explicit content in any
                            form.
                        </li>
                        <li>
                            Your package may contain social interactions, references to drugs and
                            other substances, or to non-explicit violent content, as well as
                            allowing real currency interaction; but in that case, this must be
                            properly specified in your package's manifest.
                        </li>
                        <li>
                            Your package may collect user data including telemetry, but this must be
                            explicitly notified to the user and he/she must have the right to opt
                            out of it at any time.
                        </li>
                    </ul>
                </p>
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">Service "AS IS"</h2>
                <p>
                    We make no express or implied warranty about Konbini. It's service is provided
                    "AS IS", thus Hana disclaims all implied warranties, including any warranty of
                    merchantability and warranty of fitness for a particular purpose.
                </p>
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">
                    Limitation of liability
                </h2>
                <p>
                    Hana does not exclude liability where prohibited. In countries where these forms
                    of limitation is prohibited, we shall only be responsible to you and your loss.
                    <br />
                    <br />
                    In countries where limitation of liability is allowed, Hana is not liable for
                    any direct, indirect, incidental, consequential, or special damages, including
                    but not limited to loss of profits, business interruption, or loss of data, that
                    cannot be proven to be direct fault of us in the form of negligence, bad faith
                    or willful misconduct.
                    <br />
                    Hana is not liable for the behavior of any of our users or publishers.
                </p>
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">
                    Resolution of Legal Disputes
                </h2>
                <p>
                    As of now, Hana lacks a legal office. We're still in the process of registering
                    one. Because of this, disputes between you and Hana can only be resolved
                    informally, you may contact us for this purpose at any time.
                </p>
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">Contact</h2>
                <p>
                    You may contact us at any time for questions, claims, or anything else.
                    <br />
                    <br />
                    As of now, Konbini is operated by The Hana Organization, informally based in
                    Spain (with no official office at the moment).
                    <br />
                    <br />
                    For any purpose, be it legal or not, you may contact us via e-mail at{" "}
                    <a href="mailto:hanaorg@proton.me">hanaorg@proton.me</a>.
                </p>
            </div>
            <Footer />
        </>
    );
}
