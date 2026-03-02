import { defineConfig } from "tsdown";

export default defineConfig([
  {
    clean: true,
    dts: true,
    outDir: "lib",
    entry: ["src/index.ts"],
    format: ["esm"],
    treeshake: true,
    fixedExtension: false,
    external: ["@eslint/plugin-kit", "@eslint/core"],
  },
]);
