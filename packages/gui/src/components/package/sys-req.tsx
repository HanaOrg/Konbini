import { type KONBINI_MANIFEST } from "shared/types/manifest";

export default function SystemRequirementsTable({
    requirements,
}: {
    requirements: KONBINI_MANIFEST["requirements"];
}) {
    const req = requirements!;

    return (
        <>
            <h2 className="mt-12 mb-4 text-3xl text-white font-semibold">System requirements</h2>
            <div className="flex flex-row gap-12">
                {req.os_ver && (
                    <div className="flex flex-col gap-1">
                        <b className="mb-2">OS</b>
                        {req.os_ver.win && (
                            <p>
                                <b>Windows</b> | {req.os_ver.win}
                            </p>
                        )}
                        {req.os_ver.mac && (
                            <p>
                                <b>macOS</b> | {req.os_ver.mac}
                            </p>
                        )}
                        {req.os_ver.lin && (
                            <p>
                                <b>Linux</b> | {req.os_ver.lin}
                            </p>
                        )}
                    </div>
                )}
                {req.ram_mb && (
                    <div className="flex flex-col gap-1">
                        <b className="mb-2">RAM</b>
                        {req.ram_mb} MB
                    </div>
                )}
                {req.disk_mb && (
                    <div className="flex flex-col gap-1">
                        <b className="mb-2">Storage</b>
                        {req.disk_mb} MB
                    </div>
                )}
            </div>
        </>
    );
}
