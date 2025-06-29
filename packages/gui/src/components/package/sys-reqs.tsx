import { parseOsVer, type KONBINI_MANIFEST } from "shared/types/manifest";

export default function SystemRequirementsTable({
    requirements,
}: {
    requirements: KONBINI_MANIFEST["sys_requirements"];
}) {
    const reqs = requirements!;
    const osVer = reqs.os_ver ? parseOsVer(reqs.os_ver) : null;

    return (
        <>
            <h2 className="mt-12 mb-4 text-3xl text-white font-semibold">System requirements</h2>
            <div className="flex flex-row gap-12">
                {reqs.os_ver && osVer && osVer !== "Invalid OS requirements." && (
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
                {reqs.ram_mb && (
                    <div className="flex flex-col gap-1">
                        <b className="mb-2">RAM</b>
                        {reqs.ram_mb} MB
                    </div>
                )}
                {reqs.disk_mb && (
                    <div className="flex flex-col gap-1">
                        <b className="mb-2">Storage</b>
                        {reqs.disk_mb} MB
                    </div>
                )}
            </div>
        </>
    );
}
