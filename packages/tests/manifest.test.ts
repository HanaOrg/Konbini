// first test in here because of how complex the KPS system is getting
import { describe, expect, test } from "bun:test";
import { locatePkg, locateUsr, parseID } from "shared/api/core";
import { constructKps, parseKps } from "shared/api/manifest";
import { isAuthorId } from "shared/types/author";
import {
    getAgeRating,
    isKps,
    isRepositoryScope,
    isValidManifest,
    parseRepositoryScope,
} from "shared/types/manifest";

describe("KPS system works", () => {
    test("KPS type checking works", () => {
        expect(isKps("kbi:foobar")).toEqual(true);
        expect(isKps("apt:foobar@srcset")).toEqual(true);

        expect(isKps("whatever:foobar")).toEqual(false);
        expect(isKps("kbi:")).toEqual(false);
    });

    test("base KPS system works", () => {
        expect(parseKps("kbi:something")).toEqual({
            src: "kbi",
            value: "something",
            cmd: null,
            name: "Konbini",
        });

        expect(parseKps("apt:something")).toEqual({
            src: "apt",
            value: "something",
            cmd: "apt",
            name: "DPKG",
        });

        expect(parseKps("brew-k:something")).toEqual({
            src: "brew-k",
            value: "something",
            cmd: "brew --cask",
            name: "Homebrew",
        });
    });

    test("extended KPS system works", () => {
        expect(parseKps("apt:something@hi/bro")).toEqual({
            src: "apt",
            value: "something",
            cmd: "apt",
            name: "DPKG",
            at: {
                url: "hi/bro",
                name: null,
            },
        });

        expect(parseKps("scp:something@hi/bro#bucket-name")).toEqual({
            src: "scp",
            value: "something",
            cmd: "scoop",
            name: "Scoop",
            at: {
                url: "hi/bro",
                name: "bucket-name",
            },
        });

        expect(parseKps("scp:something@-#bucket-name")).toEqual({
            src: "scp",
            value: "something",
            cmd: "scoop",
            name: "Scoop",
            at: {
                url: null,
                name: "bucket-name",
            },
        });
    });
});

describe("KPS constructing works", () => {
    test("simple KPS constructed", () => {
        expect(
            constructKps({
                src: "wget",
                cmd: "winget",
                value: "something",
                name: "WinGet",
            }),
        ).toEqual("wget:something");
    });

    test("complex KPS constructed (without name)", () => {
        expect(
            constructKps({
                src: "apt",
                cmd: "apt",
                value: "something",
                name: "DPKG",
                at: {
                    url: "some/ppa",
                    name: null,
                },
            }),
        ).toEqual("apt:something@some/ppa");
    });

    test("complex KPS constructed (with name)", () => {
        expect(
            constructKps({
                src: "scp",
                cmd: "scoop",
                value: "something",
                name: "Scoop",
                at: {
                    url: "some.url",
                    name: "something-else",
                },
            }),
        ).toEqual("scp:something@some.url#something-else");
        expect(
            constructKps({
                src: "scp",
                cmd: "scoop",
                value: "something",
                name: "Scoop",
                at: {
                    url: null,
                    name: "extras",
                },
            }),
        ).toEqual("scp:something@-#extras");
    });
});

describe("validates and handles IDs", () => {
    test("package IDs", () => {
        expect(() => locatePkg("a")).toThrow("Invalid author/package ID length");
        expect(() => locatePkg("a.b")).toThrow("Invalid author/package ID prefix");
        expect(() => locatePkg(".b")).toThrow("Invalid author/package ID prefix");
        expect(() => locatePkg("usr.")).toThrow("No 2nd part of author/package ID");
        expect(() => locatePkg("usr.b")).toThrow("Delimiter too short");
        expect(() => locatePkg("usr.bbb")).toThrow("No package provided for supposedly package ID");
        expect(locatePkg("org.hana.zaiko")).toEqual({
            manifest: "https://konbini-data.vercel.app/api/pkg?id=org.hana.zaiko",
            manifestPub: "https://github.com/HanaOrg/KonbiniPkgs/blob/main/za/org.hana/zaiko.yaml",
        });
    });

    test("user IDs", () => {
        expect(() => locateUsr("a")).toThrow("Invalid author/package ID length");
        expect(() => locateUsr("a.b")).toThrow("Invalid author/package ID prefix");
        expect(() => locateUsr(".b")).toThrow("Invalid author/package ID prefix");
        expect(() => locateUsr("usr.")).toThrow("No 2nd part of author/package ID");
        expect(() => locateUsr("usr.b")).toThrow("Delimiter too short");
        expect(locateUsr("org.hana")).toEqual({
            manifest: "https://konbini-data.vercel.app/api/author?id=org.hana",
            manifestPub: "https://github.com/HanaOrg/KonbiniAuthors/blob/main/org/ha/hana.yaml",
            signature:
                "https://raw.githubusercontent.com/HanaOrg/KonbiniAuthors/main/org/ha/hana.asc",
            signaturePub: "https://github.com/HanaOrg/KonbiniAuthors/blob/main/org/ha/hana.asc",
        });
    });
});
describe("handles repository scopes", () => {
    test("github", () => {
        const res = parseRepositoryScope("gh:HanaOrg/Konbini");
        expect(res.source).toEqual("gh");
        expect(res.main).toEqual("https://api.github.com/repos/HanaOrg/Konbini");
        expect(res.public).toEqual("https://github.com/HanaOrg/Konbini");
        expect(res.all_releases).toEqual("https://api.github.com/repos/HanaOrg/Konbini/releases");
        expect(res.release("1.0.0")).toEqual(
            "https://api.github.com/repos/HanaOrg/Konbini/releases/tags/1.0.0",
        );
        expect(res.file("main", "foobar")).toEqual(
            "https://raw.githubusercontent.com/HanaOrg/Konbini/main/foobar",
        );
    });

    test("codeberg", () => {
        const res = parseRepositoryScope("cb:HanaOrg/Konbini");
        expect(res.source).toEqual("cb");
        expect(res.main).toEqual("https://codeberg.org/api/v1/repos/HanaOrg/Konbini");
        expect(res.public).toEqual("https://codeberg.org/HanaOrg/Konbini");
        expect(res.all_releases).toEqual(
            "https://codeberg.org/api/v1/repos/HanaOrg/Konbini/releases",
        );
        expect(res.release("1.0.0")).toEqual(
            "https://codeberg.org/api/v1/repos/HanaOrg/Konbini/releases/tags/1.0.0",
        );
        expect(res.file("master", "foobar")).toEqual(
            "https://codeberg.org/HanaOrg/Konbini/raw/master/foobar",
        );
    });

    test("gitlab", () => {
        const res = parseRepositoryScope("gl:HanaOrg/Konbini");
        expect(res.source).toEqual("gl");
        expect(res.main).toEqual("https://gitlab.com/api/v4/projects/HanaOrg%2FKonbini");
        expect(res.public).toEqual("https://gitlab.com/HanaOrg/Konbini");
        expect(res.all_releases).toEqual(
            "https://gitlab.com/api/v4/projects/HanaOrg%2FKonbini/releases",
        );
        expect(res.release("1.0.0")).toEqual(
            "https://gitlab.com/api/v4/projects/HanaOrg%2FKonbini/releases/1.0.0",
        );
        expect(res.file("master", "foobar")).toEqual(
            "https://gitlab.com/HanaOrg/Konbini/-/raw/master/foobar",
        );
    });

    test("invalid stuff", () => {
        expect(isRepositoryScope("a")).toEqual(false);
        expect(isRepositoryScope("gh:")).toEqual(false);
        expect(isRepositoryScope("gh:a/")).toEqual(false);
        expect(isRepositoryScope("a/a")).toEqual(false);
        expect(isRepositoryScope("gh:/a")).toEqual(false);
        expect(isRepositoryScope("invalid:a/a")).toEqual(false);
        expect(isRepositoryScope("gh:HanaOrg/Konbini")).toEqual(true);
    });
});

describe("handles age ratings", () => {
    test("handles all age ratings", () => {
        expect(
            getAgeRating({
                money: true,
                violence: true,
                substances: true,
                social: true,
            }),
        ).toEqual("very_high");

        expect(
            getAgeRating({
                money: false,
                violence: true,
                substances: false,
                social: false,
            }),
        ).toEqual("very_high");

        expect(
            getAgeRating({
                money: true,
                violence: false,
                substances: false,
                social: true,
            }),
        ).toEqual("high");

        expect(
            getAgeRating({
                money: false,
                violence: false,
                substances: false,
                social: true,
            }),
        ).toEqual("mid");

        expect(
            getAgeRating({
                money: false,
                violence: false,
                substances: false,
                social: false,
            }),
        ).toEqual("everyone");
    });
});

describe("validates manifests", () => {
    test("recognizes valid ones", () => {
        expect(
            isValidManifest({
                repository: "gh:HanaOrg/Konbini",
                platforms: {
                    linux64: "kbi:kbi-linux-x64",
                    linuxArm: "kbi:kbi-linux-arm64",
                    mac64: "kbi:kbi-macos-x64",
                    macArm: "kbi:kbi-macos-arm64",
                    win64: "kbi:kbi-win64.exe",
                },
                type: "cli",
                name: "Konbini",
                slogan: "Your convenience store",
                desc: "Sample description woo",
                license: "AGPLv3",
                author: "org.hana",
                telemetry: true,
                age_rating: { money: false, social: false, substances: false, violence: false },
            }),
        ).toEqual(true);

        expect(
            isValidManifest({
                repository: "gh:HanaOrg/Konbini",
                platforms: {
                    linux64: "kbi:kbi-linux-x64",
                    linuxArm: "kbi:kbi-linux-arm64",
                    mac64: "kbi:kbi-macos-x64",
                    macArm: "kbi:kbi-macos-arm64",
                    win64: "kbi:kbi-win64.exe",
                },
                type: "cli",
                name: "Konbini",
                slogan: "Your convenience store",
                desc: "Sample description woo",
                license: "AGPLv3",
                author: "org.hana",
                telemetry: true,
                age_rating: { money: false, social: false, substances: false, violence: false },
                icon: "https://hana-org.vercel.app/konbini.png",
                maintainers: [
                    {
                        name: "Zaka",
                        github: "ZakaHaceCosas",
                    },
                ],
                screenshots: [
                    {
                        text: "Foobar",
                        url: "https://foo.bar/image.png",
                    },
                ],
                categories: ["EDUCATION", "PRODUCTIVITY"],
                requirements: {
                    os_ver: {
                        win: "Windows XP or later",
                        mac: "None, don't buy those",
                        lin: "Debian 10 or later",
                    },
                    ram_mb: 1024,
                    disk_mb: 2048,
                },
                homepage: "https://konbini.vercel.app",
                docs: "https://github.com/HanaOrg/Konbini/tree/main/doc",
            }),
        ).toEqual(true);

        expect(
            isValidManifest({
                repository: "gh:HanaOrg/Konbini",
                platforms: {
                    linux64: null,
                    win64: "kbi:kbi-win64.exe",
                },
                type: "cli",
                name: "Konbini",
                slogan: "Your convenience store",
                desc: "Sample description woo",
                license: "AGPLv3",
                author: "org.hana",
                telemetry: true,
                age_rating: { money: false, social: false, substances: false, violence: false },
                icon: "https://hana-org.vercel.app/konbini.png",
                maintainers: [
                    {
                        name: "Zaka",
                        github: "ZakaHaceCosas",
                    },
                ],
                screenshots: [
                    {
                        text: "Foobar",
                        url: "https://foo.bar/image.png",
                    },
                ],
                categories: ["EDUCATION", "PRODUCTIVITY"],
                requirements: {
                    os_ver: {
                        win: "Windows XP or later",
                        mac: "None, don't buy those",
                        lin: "Debian 10 or later",
                    },
                    ram_mb: 1024,
                    disk_mb: 2048,
                },
                homepage: "https://konbini.vercel.app",
                docs: "https://github.com/HanaOrg/Konbini/tree/main/doc",
            }),
        ).toEqual(true);
    });

    test("recognizes invalid ones", () => {
        expect(
            isValidManifest({
                repository: "gh:HanaOrg/Konbini",
                platforms: {
                    linux64: "kbi:kbi-linux-x64",
                    linuxArm: "kbi:kbi-linux-arm64",
                    mac64: "kbi:kbi-macos-x64",
                    macArm: "kbi:kbi-macos-arm64",
                    win64: "kbi:kbi-win64.exe",
                },
                type: "cli",
                name: "Konbini",
                slogan: "Your convenience store",
                desc: "Sample description woo",
                license: "AGPLv3",
                author: "org.hana",
                telemetry: true,
            }),
        ).toEqual(false);

        expect(
            isValidManifest({
                repository: "gh:HanaOrg/Konbini",
                platforms: {
                    linuxArm: "kbi:kbi-linux-arm64",
                    mac64: "kbi:kbi-macos-x64",
                    macArm: "kbi:kbi-macos-arm64",
                    win64: "kbi:kbi-win64.exe",
                },
                type: "cli",
                name: "Konbini",
                slogan: "Your convenience store",
                license: "AGPLv3",
                author: "org.hana",
                telemetry: true,
                age_rating: { money: false, social: false, substances: false, violence: false },
            }),
        ).toEqual(false);

        expect(
            isValidManifest({
                repository: "gh:HanaOrg/Konbini",
                platforms: {
                    win64: "kbi:kbi-win64.exe",
                },
                name: "Konbini",
                slogan: "Your convenience store",
                desc: "Sample description woo",
                license: "AGPLv3",
                author: "org.hana",
                telemetry: true,
                age_rating: { money: false, social: false, substances: false, violence: false },
            }),
        ).toEqual(false);

        expect(
            isValidManifest({
                repository: "agh:HanaOrg/Konbini",
                platforms: {
                    linux64: "kbi:kbi-linux-x64",
                    linuxArm: "kbi:kbi-linux-arm64",
                    mac64: "kbi:kbi-macos-x64",
                    macArm: "kbi:kbi-macos-arm64",
                    win64: "kbi:kbi-win64.exe",
                },
                type: "cli",
                name: "Konbini",
                slogan: "Your convenience store",
                desc: "Sample description woo",
                license: "AGPLv3",
                author: "org.hana",
                telemetry: true,
                age_rating: { money: false, social: false, substances: false, violence: false },
            }),
        ).toEqual(false);
    });
});

describe("author and package IDs work", () => {
    test("author IDs", () => {
        expect(isAuthorId("org.foobar")).toEqual(true);
        expect(isAuthorId("org.foobar.package")).toEqual(false);

        expect(parseID("org.foobar")).toEqual({
            pref: "org",
            delimiter: "fo",
            user: "foobar",
            package: null,
            user_id: "org.foobar",
            package_id: null,
        });
        expect(parseID("org.foobar.package")).toEqual({
            pref: "org",
            delimiter: "pa",
            user: "foobar",
            package: "package",
            user_id: "org.foobar",
            package_id: "org.foobar.package",
        });
        expect(() => parseID("hi")).toThrow();
    });
});
