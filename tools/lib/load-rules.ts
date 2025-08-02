import path from "path";
import fs from "fs";
import type { RuleModule } from "../../src/types.js";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get the all rules
 * @returns {Array} The all rules
 */
async function readRules() {
  const rules: Promise<RuleModule>[] = [];
  const rulesLibRoot = path.resolve(dirname, "../../src/rules");
  for (const name of fs
    .readdirSync(rulesLibRoot)
    .filter((n) => n.endsWith(".ts"))) {
    const ruleName = name.replace(/\.ts$/u, "");
    const ruleId = `markdown-preferences/${ruleName}`;

    rules.push(
      import(path.join(rulesLibRoot, name))
        .then((m) => m.default || m)
        .then((rule) => {
          rule.meta.docs.ruleName = ruleName;
          rule.meta.docs.ruleId = ruleId;
          return rule;
        }),
    );
  }
  return Promise.all(rules);
}

export const rules = await readRules();
