---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/no-multi-spaces"
description: "disallow multiple spaces"
since: "v0.21.0"
---

# markdown-preferences/no-multi-spaces

> disallow multiple spaces

- ⚙️ This rule is included in `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule reports multiple consecutive spaces in Markdown content, except in cases where multiple spaces are meaningful or required by Markdown syntax (such as in code blocks, inline code, HTML, tables, frontmatter, or immediately after blockquote markers).

The purpose of this rule is to prevent unintentional extra spaces, which can make Markdown files harder to read and maintain, or cause inconsistent rendering across different viewers.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/no-multi-spaces: 'error' -->

<!-- ✓ GOOD -->

Lorem ipsum.

## Section Title

<!-- ✗ BAD -->

Lorem   ipsum.

##   Section  Title
```

<!-- prettier-ignore-end -->

### Exceptions

This rule does not apply to code blocks, inline code, HTML, tables, frontmatter, or spaces immediately after blockquote markers.

- Code blocks and inline code may require multiple spaces for their content.
- HTML may require multiple spaces in some attribute values and/or content.
- Tables may use multiple spaces for column alignment. But note that this rule does not ignore spaces in table delimiter rows (the second row of a table).
- Frontmatter may require multiple spaces depending on the format.
- Spaces immediately after blockquote markers are treated as indentation.

## 🛠 Options

This rule has no options.

## 👫 Related Rules

- [markdown-preferences/no-multiple-empty-lines](./no-multiple-empty-lines.md)
- [markdown-preferences/no-trailing-spaces](./no-trailing-spaces.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.21.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/no-multi-spaces.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/no-multi-spaces.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/no-multi-spaces)
