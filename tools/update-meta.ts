import fs from "fs";
import path from "path";
import { ESLint } from "eslint";
import pkg from "../package.json" with { type: "json" };
import { fileURLToPath } from "url";

const { name, version } = pkg;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const META_PATH = path.join(dirname, "../src/meta.ts");

void main();

/** main */
async function main() {
  if (!fs.existsSync(META_PATH)) {
    fs.writeFileSync(META_PATH, "", "utf8");
  }
  const eslint = new ESLint({ fix: true });
  const [result] = await eslint.lintText(
    `/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "npm run update"
 */
export const name = ${JSON.stringify(name)} as const;
export const version = ${JSON.stringify(version)} as const;
`,
    { filePath: META_PATH },
  );
  fs.writeFileSync(META_PATH, result.output!);
}
