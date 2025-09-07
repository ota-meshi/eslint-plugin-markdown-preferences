import type { RuleModule } from "../src/types.js";
import { CATEGORY_DESCRIPTIONS, compareCategories } from "./lib/categories.ts";
import { rules } from "./lib/load-rules.js";

//eslint-disable-next-line jsdoc/require-jsdoc -- tool
export default function renderRulesTableContent(
  categoryLevel: number,
  buildRulePath = (ruleName: string) => `./${ruleName}.md`,
): string {
  const pluginRules = rules.filter((rule) => !rule.meta.deprecated);

  const deprecatedRules = rules.filter((rule) => rule.meta.deprecated);

  const categories = [
    ...new Set<string>(pluginRules.map((rule) => rule.meta.docs.listCategory)),
  ].sort(compareCategories);

  // -----------------------------------------------------------------------------

  //eslint-disable-next-line jsdoc/require-jsdoc -- tool
  function toRuleRow(rule: RuleModule) {
    const fixableMark = rule.meta.fixable ? "🔧" : "";
    const recommendedMark = rule.meta.docs.categories?.includes("recommended")
      ? "⭐"
      : "";
    const standardMark = rule.meta.docs.categories?.includes("standard")
      ? "💄"
      : "";
    const link = `[${rule.meta.docs.ruleId}](${buildRulePath(
      rule.meta.docs.ruleName || "",
    )})`;
    const description = rule.meta.docs.description || "(no description)";

    return `| ${link} | ${description} | ${fixableMark} | ${recommendedMark}${standardMark} |`;
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
  let rulesTableContent = categories
    .map((category) => {
      return `
#${"#".repeat(categoryLevel)} ${category} Rules
${CATEGORY_DESCRIPTIONS[category] ? `\n- ${CATEGORY_DESCRIPTIONS[category]}\n` : ""}
<!-- eslint-disable markdown-links/no-dead-urls -- Auto generated -->

<!-- prettier-ignore-start -->

| Rule ID | Description | Fixable | Config      |
|:--------|:------------|:-------:|:-----------:|
${pluginRules
  .filter((rule) => rule.meta.docs.listCategory === category)
  .map(toRuleRow)
  .join("\n")}

<!-- prettier-ignore-end -->

<!-- eslint-enable markdown-links/no-dead-urls -- Auto generated -->
`;
    })
    .join("");

  // -----------------------------------------------------------------------------
  if (deprecatedRules.length >= 1) {
    rulesTableContent += `
## Deprecated

- ⚠️ We're going to remove deprecated rules in the next major release. Please migrate to successor/new rules.
- 😇 We don't fix bugs which are in deprecated rules since we don't have enough resources.

<!-- eslint-disable markdown-links/no-dead-urls -- Auto generated -->

<!-- prettier-ignore-start -->

| Rule ID | Replaced by |
|:--------|:------------|
${deprecatedRules.map(toDeprecatedRuleRow).join("\n")}

<!-- prettier-ignore-end -->

<!-- eslint-enable markdown-links/no-dead-urls -- Auto generated -->
`;
  }
  return `${rulesTableContent}`;
}
