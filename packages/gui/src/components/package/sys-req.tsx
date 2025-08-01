import { parseOsVer, type KONBINI_MANIFEST } from "shared/types/manifest";

export default function SystemRequirementsTable({
    requirements,
}: {
    requirements: KONBINI_MANIFEST["sys_requirements"];
}) {
    const req = requirements!;
    const osVer = req.os_ver ? parseOsVer(req.os_ver) : null;

    return (
        <>
            <h2 className="mt-12 mb-4 text-3xl text-white font-semibold">System requirements</h2>
            <div className="flex flex-row gap-12">
                {req.os_ver && osVer && osVer !== "Invalid OS requirements." && (
                    <div className="flex flex-col gap-1">
                        <b className="mb-2">OS</b>
                        {osVer.win && (
                            <p>
                                <b>Windows</b> | {osVer.win}
                            </p>
                        )}
                        {osVer.mac && (
                            <p>
                                <b>macOS</b> | {osVer.mac}
                            </p>
                        )}
                        {osVer.lin && (
                            <p>
                                <b>Linux</b> | {osVer.lin}
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
