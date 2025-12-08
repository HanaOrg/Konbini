import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        rules: {
            "semi": "error",
            "prefer-const": "error",
        },
        ignores: ["packages/gui/dist/**", "**/node_modules/**"],
    },
]);
