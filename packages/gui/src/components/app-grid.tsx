import IconWin from "../assets/win";
import IconTux from "../assets/tux";
import IconMac from "../assets/mac";
import type { MANIFEST_WITH_ID } from "../routes/home";
import type { KONBINI_ID_PKG } from "shared/types/author";
import type { KDATA_ENTRY } from "../../../client/guard/guard";

export default function AppGrid({
    apps,
    desc,
    title,
}: {
    apps: Record<KONBINI_ID_PKG, MANIFEST_WITH_ID> | KDATA_ENTRY[];
    title: string;
    desc: string;
}) {
    return (
        <div className="flex flex-col">
            <h2 className="text-3xl font-semibold text-white hide_on_no_results">{title}</h2>
            <p className="mb-4 hide_on_no_results">{desc}</p>
            <div className="app-grid hide_on_no_results">
                {Object.values(apps).map((app) => (
                    <a
                        href={`/package/${app.id}`}
                        className="overflow-hidden hover:opacity-[0.9] active:scale-[0.95] active:opacity-[0.8] duration-100 rounded-xl bg-[#FFFFFF14] p-6 border-1 border-[#FFFFFF17] flex flex-col gap-2 relative"
                    >
                        {app.icon && (
                            <img
                                className="w-24 h-24 absolute bottom-[-5px] right-[-5px] blur-[60px]"
                                src={app.icon}
                                alt={`${app.name}'s icon`}
                            />
                        )}
                        <div className="hidden __konbini_item_info_giver">
                            {app.name}
                            {app.slogan}
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            {app.icon && (
                                <img
                                    className="w-10 h-10 rounded-sm"
                                    src={app.icon}
                                    alt={`${app.name}'s icon`}
                                />
                            )}
                            <h3 className="text-white text-2xl font-semibold" key={app.name}>
                                {app.name}
                            </h3>
                        </div>
                        <p className="text-white text-lg/[105%] font-normal">{app.slogan}</p>
                        <div className="mt-auto flex flex-row gap-2 items-center">
                            {app.platforms.win64 && <IconWin />}
                            {(app.platforms.linux64 || app.platforms.linuxArm) && <IconTux />}
                            {(app.platforms.mac64 || app.platforms.macArm) && <IconMac />}
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
