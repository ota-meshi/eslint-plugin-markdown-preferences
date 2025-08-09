---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/prefer-autolinks"
description: "enforce the use of autolinks for URLs"
since: "v0.11.0"
---

# markdown-preferences/prefer-autolinks

> enforce the use of autolinks for URLs

- ⚙️ This rule is included in `plugin.configs.recommended`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule promotes a modern, consistent Markdown style by requiring autolinks wherever possible. Using autolinks (`<https://example.com>`) makes your documentation cleaner, easier to read, and simpler to maintain by removing unnecessary or redundant link syntax.

Autolinks should be used in the following situations:

- When a bare URL appears by itself (see [GFM autolinks extension][Autolinks (extension)])
- When an inline link’s label and URL are identical (e.g., `[https://example.com](https://example.com)`)

Converting these patterns to autolinks keeps your Markdown concise and readable.

**How is this different from [`@eslint/markdown`]'s [markdown/no-bare-urls] rule?**

- [markdown/no-bare-urls] only reports bare URLs (e.g., `https://example.com`) and auto-fixes them to autolinks.
- This rule also reports and auto-fixes redundant inline links where the label and URL are identical—cases not handled by [markdown/no-bare-urls].
<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/prefer-autolinks: 'error' -->

<!-- ✓ GOOD (autolink is preferred) -->

- <https://example.com>

<!-- ✗ BAD (these will be auto-fixed) -->

- [https://example.com](https://example.com) <!-- Redundant inline link -->
- https://example.com <!-- Bare URL -->
```

[`@eslint/markdown`]: https://github.com/eslint/markdown

## 🔧 Options

This rule has no options.

## 📚 Further Reading

- [GitHub Flavored Markdown: Autolinks](https://github.github.com/gfm/#autolinks)
- [GitHub Flavored Markdown: Autolinks (extension)][Autolinks (extension)]
- [CommonMark: Autolinks](https://spec.commonmark.org/0.31.2/#autolinks)

[Autolinks (extension)]: https://github.github.com/gfm/#autolinks-extension-

## 👫 Related Rules

- [markdown/no-bare-urls]

[markdown/no-bare-urls]: https://github.com/eslint/markdown/blob/main/docs/rules/no-bare-urls.md

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.11.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/prefer-autolinks.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/prefer-autolinks.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/prefer-autolinks)
