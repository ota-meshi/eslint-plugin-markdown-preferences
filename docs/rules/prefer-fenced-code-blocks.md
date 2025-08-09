---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/prefer-fenced-code-blocks"
description: "enforce the use of fenced code blocks over indented code blocks"
since: "v0.11.0"
---

# markdown-preferences/prefer-fenced-code-blocks

> enforce the use of fenced code blocks over indented code blocks

- ⚙️ This rule is included in `plugin.configs.recommended`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces the use of fenced code blocks (using three backticks ` ```` ` or tildes `~~~`) instead of indented code blocks (using four spaces or a tab) in Markdown files.

**Why use fenced code blocks?**

- Fenced code blocks are easier to read and maintain, especially in documents with mixed content or nested structures.
- They allow you to specify the programming language for syntax highlighting (e.g., ` ```js `), improving code clarity.
- Fenced code blocks are supported consistently across modern Markdown parsers, while indented code blocks can be ambiguous or misinterpreted, especially inside blockquotes or lists.
- Indented code blocks can be confused with nested content or list items, leading to readability and rendering issues.

**Autofix behavior**

This rule can automatically convert simple indented code blocks to fenced code blocks. However, autofix is **not** applied if:

- The indentation is inconsistent across lines.
- The code block mixes tabs and spaces in the indentation, which can be ambiguous and unsafe to convert automatically.

**Practical notes**

- Both backtick (` ``` `) and tilde (`~~~`) fences are allowed.
- A language specifier is not required, but recommended for syntax highlighting.
- Indented code blocks inside blockquotes or lists are also targeted by this rule.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

````md
<!-- eslint markdown-preferences/prefer-fenced-code-blocks: 'error' -->

<!-- ✓ GOOD -->

```js
function foo() {
  return 42;
}
```

```js
function bar() {
  return 99;
}
```

<!-- ✗ BAD -->

    function foo() {
      return 42;
    }

>     // code in blockquote
>     function foo() {
>       return 42;
>     }
````

<!-- prettier-ignore-end -->

## 🔧 Options

This rule does not accept any options.

## 📚 Further Reading

- [CommonMark: Indented Code Blocks](https://spec.commonmark.org/0.31.2/#indented-code-blocks)
- [CommonMark: Fenced Code Blocks](https://spec.commonmark.org/0.31.2/#fenced-code-blocks)

## 👫 Related Rules

- [markdown-preferences/canonical-code-block-language]

[markdown-preferences/canonical-code-block-language]: ./canonical-code-block-language.md

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.11.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/prefer-fenced-code-blocks.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/prefer-fenced-code-blocks.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/prefer-fenced-code-blocks)
