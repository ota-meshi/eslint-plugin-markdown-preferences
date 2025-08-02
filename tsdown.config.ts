import { defineConfig } from "tsdown";

export default defineConfig([
  {
    clean: true,
    dts: true,
    outDir: "lib",
    entry: ["src/index.ts"],
    format: ["esm"],
    treeshake: true,
  },
]);
