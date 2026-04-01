// hell.test.ts
// because
// interoperability is HELL to implement

// for now i'll only write tests for very specific things i can't tell if they work or not
// end goal is to test everything everywhere, though

import { describe, expect, test } from "bun:test";
import { packageExists } from "../client/src/toolkit/aliased";

describe.if(process.platform == "win32")("chocolatey tests", () => {
    test("exists works", async () => {
        const res = packageExists("cho:chocolatey");
        expect(res).toBeTruthy();
    });
});

describe.if(process.platform == "linux")("zypper tests", () => {
    test("exists works", async () => {
        const res = packageExists("zyp:zypper");
        expect(res).toBeTruthy();
    });
});
