---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/prefer-link-reference-definitions"
description: "enforce using link reference definitions instead of inline links"
---

# markdown-preferences/prefer-link-reference-definitions

> enforce using link reference definitions instead of inline links

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces the use of link reference definitions instead of inline links when the same URL is used multiple times (2 or more by default). This improves readability and maintainability of Markdown documents by keeping the link URLs organized at the bottom of sections.

The rule automatically converts inline links to reference links and adds the reference definitions at the end of the current section (before the next heading).

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/prefer-link-reference-definitions: 'error' -->

<!-- ✓ GOOD -->
- [ESLint] is a JavaScript linter.
- [ESLint][eslint] helps maintain code quality.

[eslint]: https://eslint.org

<!-- ✗ BAD -->
- [ESLint](https://eslint.org) is a JavaScript linter.
- [ESLint](https://eslint.org) helps maintain code quality.
```

## 🔧 Options

You can configure the minimum number of links required to trigger this rule.

```json
{
  "markdown-preferences/prefer-link-reference-definitions": [
    "error",
    {
      "minLinks": 2
    }
  ]
}
```

- `minLinks`: The minimum number of links with the same URL to trigger the rule. Default is `2`.

### `minLinks`

The minimum number of links with the same URL to trigger the rule. Default is `2`.

- Must be a positive integer (minimum: 1)
- When set to `1`, all inline links will be converted to reference definitions
- When set to `2` or higher, only URLs that appear multiple times will be converted

## 📚 Further reading

- [CommonMark Spec: Reference Links](https://spec.commonmark.org/0.31.2/#link-reference-definitions)

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/prefer-link-reference-definitions.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/prefer-link-reference-definitions.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/prefer-link-reference-definitions)
