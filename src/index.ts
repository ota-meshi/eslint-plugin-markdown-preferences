export * from "./rule-types.ts";
import type { RuleModule } from "./types.ts";
import { rules as ruleList } from "./utils/rules.ts";
import * as recommended from "./configs/recommended.ts";
import * as meta from "./meta.ts";
import type { Linter } from "eslint";
import type { RuleDefinition } from "@eslint/core";

const configs = {
  recommended: recommended satisfies Linter.Config,
};

const rules: Record<string, RuleDefinition> = ruleList.reduce(
  (obj, r) => {
    obj[r.meta.docs.ruleName] = r;
    return obj;
  },
  {} as { [key: string]: RuleModule },
);

export { meta, configs, rules };
export default { meta, configs, rules };
