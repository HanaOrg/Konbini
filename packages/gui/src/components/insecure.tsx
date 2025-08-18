import type { KDATA_ENTRY_PKG } from "shared/types/kdata";

export default function InsecurePackage({
    res,
    app,
}: {
    res: {
        date: string;
        results: {
            safe: boolean;
            authentic: boolean;
            integral: boolean;
        };
    };
    app: KDATA_ENTRY_PKG;
}) {
    return (
        <div className="flex flex-col absolute z-99 gap-5 p-10 px-30 top-0 left-0 right-0 bottom-0 bg-red-700/60 backdrop-blur-lg">
            <h2 className="text-4xl font-bold text-white">
                This package has
                <br />
                been reported as unsafe!
            </h2>
            <p>
                <a href="/" className="!text-white">
                    Click here to go back home.
                </a>{" "}
                Keep reading for more info, if you want to.
            </p>
            <h3 className="text-2xl font-bold text-white">What happened</h3>
            <p className="text-lg text-white font-medium">
                We're continuously scanning all packages to ensure they're secure to download. In
                the latest scan, this package did not pass all checks, so we've blocked it.
            </p>
            <h3 className="text-2xl font-bold text-white">Security checks</h3>
            <div className="p-4 rounded-lg bg-[#00000070] font-mono flex flex-col gap-2">
                {res.results.authentic ? (
                    <p>
                        <b>Package is authentic.</b> All signatures match.
                    </p>
                ) : (
                    <p>
                        <b>Package is NOT authentic.</b> At least one signature doesn't match.
                    </p>
                )}
                {res.results.integral ? (
                    <p>
                        <b>Binaries are unmodified.</b> All hashes match.
                    </p>
                ) : (
                    <p>
                        <b>Binaries are NOT unmodified.</b> At least one hash doesn't match.
                    </p>
                )}
                {res.results.safe ? (
                    <p>
                        <b>Binaries are safe.</b> AV tests pass.
                    </p>
                ) : (
                    <p>
                        <b>Binaries are NOT safe.</b> AV has flagged this package.
                    </p>
                )}
            </div>
            {!res.results.safe && (
                <p className="text-lg text-white font-medium">
                    <b>
                        The publisher, {app.author}, supposedly attempted to distribute software
                        with virus, which can damage your computer or steal personal data.
                    </b>
                </p>
            )}
            {!res.results.authentic && (
                <p className="text-lg text-white font-medium">
                    <b>
                        The publisher, {app.author}, attempted to distribute software without a
                        proper signature. It's not possible to certify if the binaries really came
                        from him or from somebody else.
                    </b>
                </p>
            )}
            {!res.results.integral && (
                <p className="text-lg text-white font-medium">
                    <b>
                        The downloadable content of this package did not pass hashing tests, meaning
                        it may have been corrupted.
                    </b>
                </p>
            )}
            <p className="text-lg text-white font-medium">
                We'll manually review them to verify if it's true or not. For now, this package has
                been blocked and is not accessible.
            </p>
            <h3 className="text-2xl font-bold text-white">
                I'm the maker of this package, what do I do?
            </h3>
            <p className="text-lg text-white">
                We will try to get in touch with you by any mean (email, and issue in your repo,
                etc...). If you did nothing wrong (meaning this is a false positive), we'll likely
                find out and manually remove this warning. If it's not,{" "}
                <i>well, consider yourself permanently banned from Konbini</i>.
            </p>
        </div>
    );
}
