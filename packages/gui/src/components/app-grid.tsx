import { normalize, removeWhitespace } from "@zakahacecosas/string-utils";
import type { FormEvent } from "preact/compat";
import type { MANIFEST_WITH_ID } from "../app";
import IconWin from "../assets/win";
import IconTux from "../assets/tux";
import IconMac from "../assets/mac";

export default function AppGrid({
    apps,
    setPage,
}: {
    apps: MANIFEST_WITH_ID[];
    setPage: (s: string) => void;
}) {
    const n = (s: string) =>
        removeWhitespace(
            normalize(s, {
                removeCliColors: true,
                strict: true,
                preserveCase: false,
            }),
        );

    function search(event: FormEvent<HTMLInputElement>) {
        const input = event.target as HTMLInputElement;
        const searchTerm = n(input.value);

        const items = document.querySelectorAll<HTMLElement>(".__konbini_item_info_giver");
        let visibleCount = 0;

        items.forEach((item) => {
            const actual = item.parentElement;
            if (!actual)
                throw new Error("This broke, a konbini info giver doesn't have a parent...");
            const text = n(item.innerText);

            if (text.includes(searchTerm)) {
                actual.classList.remove("hidden");
                visibleCount++;
            } else {
                actual.classList.add("hidden");
            }
        });

        const notFoundMessage = document.getElementById("not_found");
        if (notFoundMessage) {
            if (visibleCount === 0) {
                notFoundMessage.classList.remove("hidden");
            } else {
                notFoundMessage.classList.add("hidden");
            }
        }
    }

    return (
        <div className="app-main-cont">
            <h2>Explore Konbini packages</h2>
            <input
                type="search"
                placeholder="Search for something specific"
                onInput={(event) => search(event)}
            />
            <div id="not_found" className="hidden">
                <h1>We couldn't find anything?</h1>
                <p>
                    Sorry about that. Perhaps the package wasn't added yet to Konbini, or perhaps
                    you're just too original.
                </p>
            </div>
            <div className="app-grid">
                {apps.map((app) => (
                    <div className="app-card">
                        <div className="hidden __konbini_item_info_giver">
                            {app.name}
                            {app.slogan}
                        </div>
                        <h3 key={app.name}>{app.name}</h3>
                        <p>{app.slogan}</p>
                        <div className="icons">
                            {app.platforms.win64 && <IconWin arch="none" />}
                            {(app.platforms.linux64 || app.platforms.linuxARM) && (
                                <IconTux arch="none" />
                            )}
                            {(app.platforms.mac64 || app.platforms.macARM) && (
                                <IconMac arch="none" />
                            )}
                        </div>
                        <button
                            onClick={() => {
                                window.location.pathname = "/#" + app.id;
                                setPage(app.id);
                            }}
                        >
                            More info
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
