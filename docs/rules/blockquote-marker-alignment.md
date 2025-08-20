---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/blockquote-marker-alignment"
description: "enforce consistent alignment of blockquote markers"
since: "v0.15.0"
---

# markdown-preferences/blockquote-marker-alignment

> enforce consistent alignment of blockquote markers

- ⚙️ This rule is included in `plugin.configs.recommended`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces consistent alignment (indentation) of blockquote markers (`>`) at the same nesting level. All blockquote lines at the same level should have the same amount of indentation before their markers.

**What this rule checks:**

- Single-level blockquotes
- Multi-level nested blockquotes
- Blockquotes with various indentation levels

**What this rule does:**

- Detects inconsistent spacing before blockquote markers
- Automatically fixes alignment issues when using `--fix`

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/blockquote-marker-alignment: 'error' -->

<!-- ✓ GOOD: Consistent alignment within each nesting level -->
> First level blockquote.
> Another line at first level.
> > Nested blockquote.
> > Another nested line.
>
> Back to first level.

  > Indented blockquote.
  > All lines consistently indented.

<!-- ✗ BAD: Inconsistent alignment -->
> First level blockquote.
 > This line has extra indentation.
 >
> Back to normal.

> > Nested blockquote.
>  > This nested line has extra space.
> > Back to correct nesting.
```

<!-- prettier-ignore-end -->

## 🔧 Options

This rule has no options.

## 📚 Further Reading

- [CommonMark Spec: Block quotes](https://spec.commonmark.org/0.31.2/#block-quotes)

## 👫 Related Rules

- [markdown-preferences/no-laziness-blockquotes](./no-laziness-blockquotes.md)
- [markdown-preferences/list-marker-alignment](./list-marker-alignment.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.15.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/blockquote-marker-alignment.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/blockquote-marker-alignment.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/blockquote-marker-alignment)
