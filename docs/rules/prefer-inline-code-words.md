---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/prefer-inline-code-words"
description: "enforce the use of inline code for specific words."
---

# markdown-preferences/prefer-inline-code-words

> enforce the use of inline code for specific words.

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces that specific words or phrases are always wrapped in inline code (backticks) when they appear in Markdown text. This is useful for:

- Ensuring technical terms, API names, or function names are consistently formatted as code
- Maintaining consistent styling for programming-related terminology
- Automatically applying code formatting to specified words

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/prefer-inline-code-words: ["error", { "words": ["ESLint", "TypeScript", "npm"] }] -->

<!-- ✓ GOOD -->
Use `ESLint` with `TypeScript` for linting. Install it with `npm`.

The `ESLint` configuration file should be in the root directory.

<!-- ✗ BAD -->
Use ESLint with TypeScript for linting. Install it with npm.

The ESLint configuration file should be in the root directory.

```

## 🔧 Options

This rule requires configuration of the words that should be wrapped in inline code.

```json
{
  "markdown-preferences/prefer-inline-code-words": [
    "error",
    {
      "words": ["ESLint", "TypeScript", "JavaScript", "Prettier", "npm", "yarn"]
    }
  ]
}
```

- `words` (required): An array of strings representing the words that should always be wrapped in inline code when they appear in Markdown text.

## 📚 Further reading

- [CommonMark Spec: Code spans](https://spec.commonmark.org/0.31.2/#code-spans)
- [GitHub Flavored Markdown: Code spans](https://github.github.com/gfm/#code-spans)

## 👫 Related rules

- [markdown-preferences/prefer-linked-words]

[markdown-preferences/prefer-linked-words]: ./prefer-linked-words.md

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/prefer-inline-code-words.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/prefer-inline-code-words.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/prefer-inline-code-words)
