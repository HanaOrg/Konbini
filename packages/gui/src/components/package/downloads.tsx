import type { DownloadData } from "shared/types/kdata";

export default function DownloadChart({ downloads }: { downloads: DownloadData }) {
    // NOTE: we should turn this into an actual chart, like flathub does
    const total = downloads.installs.length + downloads.removals.length;
    const installPercentage = (downloads.installs.length / total) * 100;
    const removalPercentage = (downloads.removals.length / total) * 100;

    return (
        <>
            <h2 className="mt-12 text-3xl text-white font-semibold">Downloads vs. removals</h2>
            {downloads.removals.length ? (
                <p className="mb-4">
                    This package was{" "}
                    <b className="text-teal-300">installed {downloads.installs.length} times</b>,
                    but <b className="text-red-400">removed {downloads.removals.length} times</b>.
                </p>
            ) : (
                <p className="mb-4">
                    This package was{" "}
                    <b className="text-teal-300">installed {downloads.installs.length} times</b>. It
                    hasn't been removed by anyone yet, if it did, a{" "}
                    <b className="text-red-400">red chunk</b> would be visible in the graph.
                </p>
            )}
            <div className="flex flex-row w-full  overflow-hidden">
                <div
                    className="bg-teal-300 h-5 grid place-items-center"
                    style={{ width: `${installPercentage}%` }}
                >
                    <p className="font-bold text-sm text-black leading-none">
                        {installPercentage.toPrecision(3)}%
                    </p>
                </div>
                <div
                    className="bg-red-400 h-5 grid place-items-center"
                    style={{ width: `${removalPercentage}%` }}
                >
                    <p className="font-bold text-sm text-black leading-none">
                        {removalPercentage.toPrecision(3)}%
                    </p>
                </div>
            </div>
            <p className="mt-4 text-xs">
                Statistics aren't 100% accurate. They're meant to show the overall trend, whether
                people chooses to keep this package or tends to remove it.
            </p>
        </>
    );
}
