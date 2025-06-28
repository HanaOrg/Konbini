import { getDesktopPlatform } from "../ua";

export default function InstallDialog({ appName, appId }: { appName: string; appId: string }) {
    return (
        <dialog
            id="install_dialog"
            className="p-8 bg-[#FFFFFF08] rounded-3xl backdrop-blur-[30px] border-1 border-[#FFFFFF2E] top-[50%] left-[50%] translate-[-50%]"
        >
            <div className="flex flex-row items-start justify-between mb-4">
                <h1 style={{ fontWeight: 800, color: "#fff", fontSize: "2.5em" }}>
                    Download {appName} from Konbini
                </h1>
                <button
                    onClick={() => {
                        const m = document.querySelector("#install_dialog");
                        if (!m) {
                            console.error("No modal rendered?");
                            return;
                        }
                        (m as HTMLDialogElement).close();
                    }}
                    className="w-14 h-14 rounded-lg"
                    style={{
                        backgroundColor: "transparent",
                    }}
                >
                    X
                </button>
            </div>
            <h3 className="text-lg text-white font-bold">1. Get Konbini</h3>
            <p className="ml-4 mb-2">
                On{" "}
                {getDesktopPlatform().plat === "Windows" ? (
                    <b>a PowerShell session</b>
                ) : (
                    <b>a BASH (or your system's shell) session</b>
                )}
                , run this:
            </p>
            <code className="ml-4 p-3 rounded-lg bg-[#FFFFFF19] font-mono font-light text-sm">
                ${" "}
                {getDesktopPlatform().plat === "Windows"
                    ? 'powershell -c "irm konbini.vercel.app/dl.ps1 | iex"'
                    : "curl -fsSL konbini.vercel.app/dl.sh | bash"}
            </code>
            <h3 className="mt-4 text-lg text-white font-bold">2. Install {appName}</h3>
            <p className="ml-4 mb-2">
                Once Konbini installs, restart your terminal and run the following command:
            </p>
            <code className="ml-4 p-3 rounded-lg bg-[#FFFFFF19] font-mono font-light text-sm">
                $ kbi install {appId}
            </code>
        </dialog>
    );
}
