// hell.test.ts
// because
// interoperability is HELL to implement

// for now i'll only write tests for very specific things i can't tell if they work or not

import { describe, expect, test } from "bun:test";
import { packageExists } from "../client/src/toolkit/aliased";

describe("chocolatey tests", () => {
    test("exists works", async () => {
        const res = packageExists("cho:chocolatey");
        expect(res).toBe(true);
    });
});
