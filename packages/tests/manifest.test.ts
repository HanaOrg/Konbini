// this is the only test in here because of how complex the KPS system is getting
import { describe, expect, test } from "bun:test";
import { locatePkg, locateUsr } from "shared/api/core";
import { constructKps, parseKps } from "shared/api/manifest";

describe("KPS system works", () => {
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
            manifest:
                "https://raw.githubusercontent.com/HanaOrg/KonbiniPkgs/main/za/org.hana/zaiko.yaml",
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
            manifest:
                "https://raw.githubusercontent.com/HanaOrg/KonbiniAuthors/main/org/ha/hana.yaml",
            manifestPub: "https://github.com/HanaOrg/KonbiniAuthors/blob/main/org/ha/hana.yaml",
            signature:
                "https://raw.githubusercontent.com/HanaOrg/KonbiniAuthors/main/org/ha/hana.asc",
            signaturePub: "https://github.com/HanaOrg/KonbiniAuthors/blob/main/org/ha/hana.asc",
        });
    });
});
