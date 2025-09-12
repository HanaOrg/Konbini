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
                    <i>This is legal text.</i> <b>Last update: never.</b>
                </p>
                <hr />
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
                            <b>"You"</b> refers to you as an individual and a user of Konbini.
                        </li>
                        <li>
                            <b>"Package"</b> refers to an application, library, tool, or other
                            software component contributed to Konbini, including its manifest and
                            associated metadata.
                        </li>
                        <li>
                            <b>"Konbini Guard"</b> refers to the automated systems, processes, and
                            audits used by Hana to check all uploaded Packages for malware, viruses,
                            or other unsafe behavior.
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
                    <br />
                    If your law grants a right that is not granted under Spanish law, it <i>
                        will
                    </i>{" "}
                    however be respected by these Terms, giving you the ability to enforce it
                    against us at any time.
                </p>
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">
                    About Published Packages
                </h2>
                <p>
                    Whenever you begin the process to serve a "package" through Konbini (by
                    contributing its manifest to our code repository), you are granting us certain
                    rights:
                </p>
                <ul className="my-3">
                    <li>
                        The right to accept or reject a submission for any reason.{" "}
                        <i>You will always be explained the reason in detail.</i>
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
                        The right to use your package's name, icon if provided, and any contents
                        shown in its public page for marketing, promotions, or other communications.{" "}
                        <i>
                            You will always be attributed as the package owner and maker and this
                            clause only grants us usage permission, not ownership and not the
                            ability to alter or modify your package's given image in any way.
                        </i>
                    </li>
                </ul>
                <p>
                    <b>
                        You retain all copyright and intellectual property rights over your Package,
                        except for the limited rights granted above.
                    </b>{" "}
                    Any copyright or intellectual property violation your Package may be involved in
                    in any way will always be your responsibility, even if the violation comes to
                    light as a result of our use of the Package's public information for the
                    purposes described above.
                </p>
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
                        <li>Your package must not violate any applicable law.</li>
                        <li>
                            Your package must not include malware, viruses, or any other malicious
                            or potentially unwanted software.
                        </li>
                        <li>
                            Your package must not violate the intellectual property rights of any
                            individual or organization.
                        </li>
                        <li>
                            Your package must not contain sexual or explicit content in any form.
                        </li>
                        <li>
                            May include social interactions, non-explicit violence, references to
                            drugs or other substances, or real-currency interactions; but these must
                            be properly specified in your package's manifest.
                        </li>
                        <li>
                            Your package may collect user data (including telemetry); but only if
                            the user is explicitly notified and if said user is given a clear option
                            to opt-out of any data collection (excluding any that can be proven to
                            be intrinsic to the package's functionality) at any time.
                            <ul>
                                <li>
                                    Package data collection must also comply with applicable privacy
                                    laws, including GDPR for European Union publishers.
                                </li>
                            </ul>
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
                    To the maximum extent permitted by law, Hana is not liable for any indirect,
                    incidental, consequential, or special damages, including loss of profits,
                    business interruption, or data loss, except where proven to be caused by gross
                    negligence, bad faith, or willful misconduct by Hana.
                    <br />
                    Hana is not responsible for the actions, omissions, or content of users or
                    contributors.
                    <br />
                    <br />
                    Nothing in these Terms limits any liability that cannot be legally excluded by
                    applicable law.
                </p>
                <h2 className="mt-6 text-white text-3xl font-semibold mb-2">
                    Resolution of Legal Disputes
                </h2>
                <p>
                    As of now, Hana lacks a legal office. We're still in the process of registering
                    one. Because of this, disputes between you and Hana can only be resolved
                    informally; you may contact us for this purpose at any time.{" "}
                    <i>
                        This clause does not remove your right to attempt a formal resolution
                        through a lawyer, as granted to you by applicable law. You are however
                        warned no legal office exists on our side to respond to said resolution.
                    </i>
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
