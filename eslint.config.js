import unicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";
import js from "@eslint/js";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        rules: {
            "semi": "error",
            "prefer-const": "error",
            "unicorn/prevent-abbreviations": "off",
        },
        plugins: {
            unicorn,
        },
        files: ["**/*.{js,ts}"],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            unicorn.configs.recommended,
        ],
        ignores: ["packages/gui/dist/**", "**/node_modules/**"],
    },
]);
