/* eslint @typescript-eslint/no-explicit-any: off -- util */
import type { PartialRuleModule, RuleModule, RuleContext } from "../types.js";

/**
 * Define the rule.
 * @param ruleName ruleName
 * @param rule rule module
 */
export function createRule<O extends any[]>(
  ruleName: string,
  rule: PartialRuleModule<O>,
): RuleModule {
  return {
    meta: {
      ...rule.meta,
      docs: {
        ...rule.meta.docs,
        url: `https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/${ruleName}.html`,
        ruleId: `markdown-preferences/${ruleName}`,
        ruleName,
      },
    },
    create(context: RuleContext<O>) {
      return rule.create(context);
    },
  };
}
