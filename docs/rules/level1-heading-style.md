---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/level1-heading-style"
description: "enforce consistent style for level 1 headings"
---

# markdown-preferences/level1-heading-style

> enforce consistent style for level 1 headings

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces consistent style for level 1 headings in Markdown files. Level 1 headings can be written in two formats:

1. **ATX style**: Lines that start with a single `#` character, followed by a space and the heading text
2. **Setext style**: Text followed by a line of `=` characters (underline)

Both formats are valid according to the [CommonMark specification], but mixing styles within a document or project can reduce readability and consistency.

[CommonMark specification]: https://spec.commonmark.org/0.31.2/

<!-- prettier-ignore-start -->

```md
<!-- ATX style -->
# This is a level 1 heading

<!-- Setext style -->
This is a level 1 heading
=========================
```

<!-- prettier-ignore-end -->

This rule allows you to enforce either ATX style (`"atx"`) or Setext style (`"setext"`) for all level 1 headings in your Markdown files.

**Why enforce this?**

- **Consistency**: Ensures all level 1 headings follow the same style throughout your documentation
- **Readability**: Makes it easier to scan and understand document structure
- **Tooling**: Simplifies automated processing and formatting of Markdown files
- **Maintainability**: Reduces cognitive load when editing and reviewing documentation

### Examples

#### ATX Style

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/level1-heading-style: ['error', { style: 'atx' }] -->

<!-- ✓ GOOD -->

# Introduction

# Getting Started

# Configuration

<!-- ✗ BAD -->

Introduction
============

Getting Started
===============

Configuration
=============
```

<!-- prettier-ignore-end -->

#### Setext Style

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/level1-heading-style: ['error', { style: 'setext' }] -->

<!-- ✓ GOOD -->

Introduction
============

Getting Started
===============

Configuration
=============

<!-- ✗ BAD -->

# Introduction

# Getting Started

# Configuration
```

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/level1-heading-style": [
    "error",
    {
      "style": "atx", // or "setext"
      "allowMultilineSetext": false
    }
  ]
}
```

### `style`

- Type: `"atx" | "setext"`
- Default: `"atx"`

Specifies which heading style to enforce for level 1 headings:

- `"atx"`: Enforce ATX style (`# Heading`)
- `"setext"`: Enforce Setext style (`Heading\n======`)

### `allowMultilineSetext`

- Type: `boolean`
- Default: `false`

This option only takes effect when `style` is set to `"atx"`.

When `true`, allows Setext headings that span multiple lines. When `false`, multiline Setext headings are reported as errors.

**Note**: Multiline Setext headings cannot be automatically fixed to ATX style due to the complexity of handling line breaks in heading text.

## 📚 Further Reading

- [CommonMark Spec: ATX headings](https://spec.commonmark.org/0.31.2/#atx-headings)
- [CommonMark Spec: Setext headings](https://spec.commonmark.org/0.31.2/#setext-headings)

## 👫 Related Rules

- [markdown-preferences/level2-heading-style](./level2-heading-style.md)

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/level1-heading-style.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/level1-heading-style.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/level1-heading-style)
