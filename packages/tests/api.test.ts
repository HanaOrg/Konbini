// second test in here because the API is growing complex too
import { describe, expect, test } from "bun:test";
import { /* getAuthor, getPkg, */ scanPackage } from "shared/api/kdata";

describe("KDATA (Konbini DATA API) works", () => {
    test("retrieves proper safety data", async () => {
        const full = await scanPackage("org.hana.zaiko");
        expect(new Date(full.date)).toBeValidDate();
        // our own package is obviously secure (hehe)
        // so we can just assume it'll be true
        expect(full.results).toEqual({
            safe: true,
            authentic: true,
            integral: true,
        });
    });

    // TODO: test the rest
});
