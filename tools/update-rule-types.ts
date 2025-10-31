import fs from "fs";
import path from "path";
import plugin from "../src/index.js";

const dirname = path.dirname(new URL(import.meta.url).pathname);

void main();

/**
 *
 */
async function main() {
  const { pluginsToRulesDTS } = await import("eslint-typegen/core");

  const ruleTypes = await pluginsToRulesDTS(
    { "markdown-preferences": plugin },
    { includeAugmentation: false },
  );

  void fs.writeFileSync(
    path.join(dirname, "../src/rule-types.ts"),
    `// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "npm run update"

declare module 'eslint' {
  namespace Linter {
    // @ts-ignore
    interface RulesRecord extends RuleOptions {}
  }
}
declare module '@eslint/core' {
  interface RulesConfig extends RuleOptions {
    [key: string]: RuleConfig;
  }
}

${ruleTypes}`,
  );
}
