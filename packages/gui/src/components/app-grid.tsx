import IconWin from "../assets/win";
import IconTux from "../assets/tux";
import IconMac from "../assets/mac";
import type { MANIFEST_WITH_ID } from "../routes/home";

export default function AppGrid({ apps, title }: { apps: MANIFEST_WITH_ID[]; title: string }) {
    return (
        <>
            <h2>{title}</h2>
            <div className="app-grid">
                {apps.map((app) => (
                    <div className="app-card">
                        <div className="hidden __konbini_item_info_giver">
                            {app.name}
                            {app.slogan}
                        </div>
                        <h3 key={app.name}>{app.name}</h3>
                        <p>{app.slogan}</p>
                        <div className="bottom">
                            <a href={`/package/${app.id}`}>
                                <button>More info</button>
                            </a>
                            <div className="icons">
                                {app.platforms.win64 && <IconWin arch="none" />}
                                {(app.platforms.linux64 || app.platforms.linuxARM) && (
                                    <IconTux arch="none" />
                                )}
                                {(app.platforms.mac64 || app.platforms.macARM) && (
                                    <IconMac arch="none" />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
