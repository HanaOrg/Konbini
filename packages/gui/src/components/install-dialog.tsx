import { getDesktopPlatform } from "../ua";

export default function InstallDialog({ appName, appId }: { appName: string; appId: string }) {
    return (
        <dialog id="install_dialog">
            <div className="flex">
                <h2>Download {appName} from Konbini</h2>
                <button
                    onClick={() => {
                        const m = document.querySelector("#install_dialog");
                        if (!m) {
                            console.error("No modal rendered?");
                            return;
                        }
                        (m as HTMLDialogElement).close();
                    }}
                >
                    <b>X</b>
                </button>
            </div>
            <hr />
            <h3>Step one: Get Konbini</h3>
            <p>
                On{" "}
                {getDesktopPlatform().plat === "Windows" ? (
                    <b>a PowerShell session</b>
                ) : (
                    <b>a BASH (or your system's shell) session</b>
                )}
                , run this script:
                <br />
                {getDesktopPlatform().plat === "Windows" ? (
                    <code>powershell -c "irm konbini.vercel.app/dl.ps1 | iex"</code>
                ) : (
                    <code>curl -fsSL konbini.vercel.app/dl.sh | bash</code>
                )}
            </p>
            <h3>Step two: Install this package</h3>
            <p>
                Once Konbini installs, restart your terminal and run the following command:
                <br />
                <code>kbi install {appId}</code>
            </p>
        </dialog>
    );
}
