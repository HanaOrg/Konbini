export default function Footer() {
    return (
        <>
            <footer className="p-10 bg-[#00000035] flex flex-row items-start justify-between overflow-hidden relative h-120">
                <div className="bg-[#FF0088] w-lg h-128 blur-[200px] absolute top-[-50px] left-[-150px] opacity-[0.4] z-[-1]" />
                <div className="flex flex-col items-start justify-start">
                    <a href="/">
                        <img
                            height={80}
                            className="h-20 object-scale-down cursor-pointer mb-6"
                            src="/konball.png"
                            alt="Konbini logo"
                        />
                    </a>
                    <p>
                        <i>Your convenience store.</i>
                    </p>
                    <p>
                        Copyright &copy;{" "}
                        <a
                            href="https://hana-org.vercel.app"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            The Hana Organization
                        </a>
                        , 2025
                    </p>
                </div>
                <div className="flex flex-col gap-4 items-end justify-start">
                    <a href="/safety" className="text-lg font-medium">
                        How we keep Konbini apps safe
                    </a>
                    <a href="/credits" className="text-lg font-medium">
                        Credits and acknowledgments
                    </a>
                    <a
                        href="https://github.com/HanaOrg/Konbini/blob/main/doc/README.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-medium"
                    >
                        How to publish your app
                    </a>
                    <a
                        href="https://github.com/HanaOrg/Konbini/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-medium"
                    >
                        Konbini ♥ Open Source
                    </a>
                    <a href="/tos" className="text-lg font-medium">
                        Terms of Service
                    </a>
                    <a href="/privacy" className="text-lg font-medium">
                        Privacy Policy
                    </a>
                    <div className="bg-[#FFCF574D] flex flex-col gap-2 p-4 border-2 border-[#FFFFFF33]">
                        <h3 className="text-xl font-semibold text-[#FFCC96]">
                            This is alpha software.
                        </h3>
                        <hr />
                        <p className="text-lg font-medium text-[#FFCC96]">
                            Konbini is a newly made project.
                            <br />
                            Expect bugs, issues, and missing features.
                            <br />
                            Report any issue you find. Thanks!
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
}
