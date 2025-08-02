import type { RuleModule } from "../src/types.js";
import { rules } from "./lib/load-rules.js";

//eslint-disable-next-line jsdoc/require-jsdoc -- tool
export default function renderRulesTableContent(
  categoryLevel: number,
  buildRulePath = (ruleName: string) => `./${ruleName}.md`,
): string {
  const pluginRules = rules.filter((rule) => !rule.meta.deprecated);

  const deprecatedRules = rules.filter((rule) => rule.meta.deprecated);

  // -----------------------------------------------------------------------------

  //eslint-disable-next-line jsdoc/require-jsdoc -- tool
  function toRuleRow(rule: RuleModule) {
    const fixableMark = rule.meta.fixable ? "🔧" : "";
    const recommendedMark =
      rule.meta.docs.categories &&
      rule.meta.docs.categories.includes("recommended")
        ? "⭐"
        : "";
    // const standardMark =
    //   rule.meta.docs.categories &&
    //   rule.meta.docs.categories.includes("standard")
    //     ? "⭐"
    //     : "";
    const link = `[${rule.meta.docs.ruleId}](${buildRulePath(
      rule.meta.docs.ruleName || "",
    )})`;
    const description = rule.meta.docs.description || "(no description)";

    return `| ${link} | ${description} | ${fixableMark} | ${recommendedMark} |`;
  }

  //eslint-disable-next-line jsdoc/require-jsdoc -- tool
  function toDeprecatedRuleRow(rule: RuleModule) {
    const link = `[${rule.meta.docs.ruleId}](${buildRulePath(
      rule.meta.docs.ruleName || "",
    )})`;
    const replacedRules = rule.meta.replacedBy || [];
    const replacedBy = replacedRules
      .map(
        (name) => `[markdown-preferences/${name}](${buildRulePath(name)}.md)`,
      )
      .join(", ");

    return `| ${link} | ${replacedBy || "(no replacement)"} |`;
  }

  // -----------------------------------------------------------------------------
  let rulesTableContent = `
#${"#".repeat(categoryLevel)} Markdown Rules

| Rule ID | Description | Fixable | RECOMMENDED |
|:--------|:------------|:-------:|:-----------:|
${pluginRules.map(toRuleRow).join("\n")}
`;

  // -----------------------------------------------------------------------------
  if (deprecatedRules.length >= 1) {
    rulesTableContent += `
## Deprecated

- ⚠️ We're going to remove deprecated rules in the next major release. Please migrate to successor/new rules.
- 😇 We don't fix bugs which are in deprecated rules since we don't have enough resources.

| Rule ID | Replaced by |
|:--------|:------------|
${deprecatedRules.map(toDeprecatedRuleRow).join("\n")}
`;
  }
  return rulesTableContent;
}
