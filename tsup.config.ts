import { defineConfig } from "tsup";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig(({ watch = false }) => ({
    clean: true,
    dts: true,
    target: "node22",
    entry: {
        index: "./src/index.ts",
    },
    format: ["cjs", "esm"],
    minify: isProduction,
    watch,
}));
