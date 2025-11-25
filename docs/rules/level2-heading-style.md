---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/level2-heading-style"
description: "enforce consistent style for level 2 headings"
since: "v0.18.0"
---

# markdown-preferences/level2-heading-style

> enforce consistent style for level 2 headings

- ⚙️ This rule is included in `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fix-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces consistent style for level 2 headings in Markdown files. Level 2 headings can be written in two formats:

1. **ATX style**: Lines that start with two `##` characters, followed by a space and the heading text
2. **Setext style**: Text followed by a line of `-` characters (underline)

Both formats are valid according to the [CommonMark specification], but mixing styles within a document or project can reduce readability and consistency.

[CommonMark specification]: https://spec.commonmark.org/0.31.2/

<!-- prettier-ignore-start -->

```md
<!-- ATX style -->
## This is a level 2 heading

<!-- Setext style -->
This is a level 2 heading
-------------------------
```

<!-- prettier-ignore-end -->

This rule allows you to enforce either ATX style (`"atx"`) or Setext style (`"setext"`) for all level 2 headings in your Markdown files.

**Why enforce this?**

- **Consistency**: Ensures all level 2 headings follow the same style throughout your documentation
- **Readability**: Makes it easier to scan and understand document structure
- **Tooling**: Simplifies automated processing and formatting of Markdown files
- **Maintainability**: Reduces cognitive load when editing and reviewing documentation

### Examples

#### ATX Style

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/level2-heading-style: ['error', { style: 'atx' }] -->

<!-- ✓ GOOD -->

## Installation

## Configuration

## Usage

<!-- ✗ BAD -->

Installation
------------

Configuration
-------------

Usage
-----
```

<!-- prettier-ignore-end -->

#### Setext Style

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/level2-heading-style: ['error', { style: 'setext' }] -->

<!-- ✓ GOOD -->

Installation
------------

Configuration
-------------

Usage
-----

<!-- ✗ BAD -->

## Installation

## Configuration

## Usage
```

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/level2-heading-style": [
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

Specifies which heading style to enforce for level 2 headings:

- `"atx"`: Enforce ATX style (`## Heading`)
- `"setext"`: Enforce Setext style (`Heading\n------`)

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

- [markdown-preferences/level1-heading-style](./level1-heading-style.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.18.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/level2-heading-style.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/level2-heading-style.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/level2-heading-style)
