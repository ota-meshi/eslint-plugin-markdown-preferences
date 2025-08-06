---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/prefer-inline-code-words"
description: "enforce the use of inline code for specific words."
since: "v0.4.0"
---

# markdown-preferences/prefer-inline-code-words

> enforce the use of inline code for specific words.

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
      "words": ["ESLint", "TypeScript", "JavaScript", "Prettier", "npm", "yarn"],
      "ignores": [
        {
          "words": ["ESLint", "TypeScript", "JavaScript"],
          "node": { "type": "heading", "depth": 1 }
        }
      ]
    }
  ]
}
```

- `words` (required): An array of strings representing the words that should always be wrapped in inline code when they appear in Markdown text.
- `ignores` (optional): An array of objects that specify conditions under which the rule should not apply. Each object can have:
  - `words`: An array or string of words to ignore. If not specified, all words will be ignored.
  - `node`: An object specifying conditions for ignoring nodes.

### `ignores`

You can use the `ignores` option to exclude the rule application under specific conditions. Each ignore condition is an object with the following properties:

- `words` (optional): Specifies the words to ignore. Can be specified as an array or string. If not specified, all words will be targeted.
- `node` (optional): Specifies the ignore conditions by node type or properties. Excludes nodes where the specified properties match. For example, to exclude all heading levels (`h1` to `h6`), specify `{"type": "heading"}`, and to exclude only level 1 headings (`h1`), specify `{"type": "heading", "depth": 1}`.

#### Usage Examples

```json
{
  "markdown-preferences/prefer-inline-code-words": [
    "error",
    {
      "words": ["ESLint", "TypeScript", "JavaScript"],
      "ignores": [
        {
          "words": ["ESLint", "TypeScript"],
          "node": { "type": "heading", "depth": 1 }
        },
        {
          "words": "JavaScript",
          "node": { "type": "link" }
        },
      ]
    }
  ]
}
```

In this configuration:

- "ESLint" and "TypeScript" in level 1 headings will be ignored
- "JavaScript" in links will be ignored

#### Node Types and Properties

Please refer to the [mdast](https://github.com/syntax-tree/mdast) documentation for detailed properties of each node.

## 📚 Further Reading

- [CommonMark Spec: Code spans](https://spec.commonmark.org/0.31.2/#code-spans)
- [GitHub Flavored Markdown: Code spans](https://github.github.com/gfm/#code-spans)

## 👫 Related Rules

- [markdown-preferences/prefer-linked-words]

[markdown-preferences/prefer-linked-words]: ./prefer-linked-words.md

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.4.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/prefer-inline-code-words.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/prefer-inline-code-words.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/prefer-inline-code-words)
