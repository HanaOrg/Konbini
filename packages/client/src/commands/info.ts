import { PKG_PATH } from "shared/client";
import { konsole } from "shared/client";
import { existsSync } from "fs";
import { truncate } from "@zakahacecosas/string-utils";
import { getPkgManifest, getUsrManifest } from "shared/api/core";
import { isOrganization } from "shared/types/author";
import { humanLicense } from "shared/types/manifest";

export async function showPkgInfo(pkg: string) {
    const manifest = await getPkgManifest(pkg);
    const author = await getUsrManifest(manifest.author_id);

    const name = `${konsole.clr("deeppink", manifest.name)} · ${konsole.clr("pink", manifest.slogan)}`;
    const categories = konsole.clr(
        "grey",
        (manifest.categories && manifest.categories.filter((s) => s.trim() != "").length) > 0
            ? "Categories: " + manifest.categories.join(", ")
            : "Unspecified categories",
    );
    const authors = `${konsole.clr("grey", manifest.license ? humanLicense(manifest.license) : "Unspecified license")} · Brought to you by ${author.name}${author.verified ? konsole.clr("deeppink", " [ √ ]", true) : ""} (${konsole.clr("lightgray", manifest.author_id)})`;
    const maintainers =
        manifest.maintainers && manifest.maintainers.length > 0
            ? `${konsole.clr("lightgray", "Maintained by")} ${manifest.maintainers
                  .map(
                      (m) => `${m.name}${m.email ? ` ${konsole.clr("gray", `<${m.email}>`)}` : ""}`,
                  )
                  .join(" & ")}`
            : "";
    const homepage = manifest.homepage
        ? `Website at ${konsole.clr("lightblue", manifest.homepage)}.`
        : "";
    const docs = manifest.docs
        ? `Documentation at ${konsole.clr("lightblue", manifest.docs)}.`
        : "";
    const windows = manifest.platforms.win64 ? konsole.clr("#00A4EF", "Windows", true) : "";
    const macOS =
        manifest.platforms.mac64 || manifest.platforms.macArm
            ? konsole.clr("#A2AAAD", "macintoshOS", true)
            : "";
    const linux =
        manifest.platforms.linux64 || manifest.platforms.linuxArm
            ? konsole.clr("#FFCC00", "Linux", true)
            : "";
    const platforms = `Works on ${[windows, macOS, linux].filter(Boolean).join(", ")}.`;
    konsole.adv(
        [
            name,
            categories,
            authors,
            maintainers,
            homepage,
            docs,
            platforms,
            `Learn more at ${konsole.clr("lightblue", `https://konbini.vercel.app/package/${pkg}`)}.`,
        ]
            .filter(Boolean)
            .join("\n      "),
    );
    console.log("");
    if (existsSync(PKG_PATH({ pkg, author: manifest.author_id })))
        konsole.suc("Package is installed.");
    else konsole.dbg("Package is not installed.");
    console.log("");
    console.log(
        truncate(
            manifest.desc
                .split("\n")
                .filter((s) => s.trim() != "")
                .join("\n\n      "),
            310,
            true,
        ),
    );
}

export async function showUserInfo(usr: string) {
    const author = await getUsrManifest(usr);
    const org = isOrganization(author);

    konsole.dbg(
        org
            ? author.type === "OTHER"
                ? "Organization details."
                : author.type === "PRIVATE_CORP"
                  ? "Company details."
                  : author.type === "NON_PROFIT"
                    ? "Non-profit organization details."
                    : author.type === "GOVT_ORG"
                      ? "Public organization details."
                      : "Collab organization details."
            : "User details.",
    );

    const name = `${konsole.clr("pink", author.name)}${author.verified ? konsole.clr("deeppink", " [ √ ]", true) : ""}`;
    const email = konsole.clr("gray", author.email ? `<${author.email}>` : "(No email provided)");
    const website = author.website
        ? konsole.clr("lightblue", "https://" + author.website)
        : "(No website provided)";
    const socials: string[] = [];
    for (const social of Object.entries(author.socials || {})) {
        socials.push(`${social[0]} ${konsole.clr("lightblue", `@${social[1]}`)}`);
    }
    konsole.adv([name, email, website].filter(Boolean).join(" · "));
    konsole.adv(socials.filter(Boolean).join(" · "));

    const hire = org
        ? author.hiring
            ? konsole.clr("lightgreen", "Hiring")
            : konsole.clr("crimson", "Not hiring")
        : author.for_hire
          ? konsole.clr("lightgreen", "For hire")
          : konsole.clr("crimson", "Not for hire");
    const place = org
        ? ""
        : author.org
          ? konsole.clr("lightgrey", `Works at ${konsole.clr("pink", author.org)}`)
          : "";

    konsole.adv([hire, place].filter(Boolean).join(" · "));
    console.log("");
    console.log(
        (author.biography || "This author has no biography.")
            .split("\n")
            .filter((s) => s.trim() != "")
            .join("\n\n      "),
    );
}
