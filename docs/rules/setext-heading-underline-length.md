---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/setext-heading-underline-length"
description: "enforce setext heading underline length"
since: "v0.17.0"
---

# markdown-preferences/setext-heading-underline-length

> enforce setext heading underline length

- ⚙️ This rule is included in `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fix-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces consistent underline length in setext headings. Setext headings use `=` for level 1 headings and `-` for level 2 headings, with an underline of repeating characters beneath the heading text.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/setext-heading-underline-length: 'error' -->

<!-- ✓ GOOD (exact mode - default) -->
Heading text
============

Another heading
---------------

<!-- ✗ BAD (exact mode - default) -->
Heading text is too long
===

Short heading
===========
```

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/setext-heading-underline-length: ['error', { "mode": "minimum" }] -->

<!-- ✓ GOOD (minimum mode) -->
Heading text
============

Short
=======

<!-- ✗ BAD (minimum mode) -->
Heading text is too long
===

Short heading
====
```

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/setext-heading-underline-length: ['error', { "mode": "consistent", "align": "any" }] -->

<!-- ✓ GOOD (consistent mode with align: any) -->
First heading
===========

Second heading
===========

<!-- ✗ BAD (consistent mode with align: any) -->
First heading
=============

Second heading
===
```

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/setext-heading-underline-length: ['error', { "mode": "consistent", "align": "exact" }] -->

<!-- ✓ GOOD (consistent mode with align: exact) -->
Short
=================

Long heading text
=================

<!-- ✗ BAD (consistent mode with align: exact) -->
Short
=====

Long heading text
=================
```

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/setext-heading-underline-length: ['error', { "mode": "consistent", "align": "minimum" }] -->

<!-- ✓ GOOD (consistent mode with align: minimum) -->
Short
==================

Long heading text
==================

<!-- ✗ BAD (consistent mode with align: minimum) -->
Short
================

Long heading text
================
```

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/setext-heading-underline-length: ['error', { "mode": "consistent", "align": "length", "length": 10 }] -->

<!-- ✓ GOOD (consistent mode with align: length, length: 10) -->
Short
==========

Long heading
==========

<!-- ✗ BAD (consistent mode with align: length, length: 10) -->
Short
=====

Long heading
===============
```

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/setext-heading-underline-length: ['error', { "mode": "consistent-line-length", "align": "exact" }] -->

<!-- ✓ GOOD (consistent-line-length mode with align: exact) -->

Heading
=======================

> Heading in Blockquote
> =====================

<!-- ✗ BAD (consistent-line-length mode with align: exact) -->
Heading
=====================

> Heading in Blockquote
> =====================
```

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/setext-heading-underline-length": [
    "error",
    {
      "mode": "exact"
    }
  ]
}
```

This rule accepts an object option with the following properties:

- `mode` (required):
  - `"exact"` (default): Underline length must exactly match the heading text length.
  - `"minimum"`: Underline length must be at least as long as the heading text.
  - `"consistent"`: All underlines with the same marker (= or -) must be consistent. Requires the `align` property.
  - `"consistent-line-length"`: All underlines with the same marker (= or -) must be consistent in line length, including blockquote markers and leading characters. Requires the `align` property.
- `align` (required for `consistent` and `consistent-line-length` modes):
  - `"any"`: Use the length of the first occurrence for consistency.
  - `"exact"`: All underlines must be exactly as long as the longest heading in the document.
  - `"minimum"`: All underlines must be at least as long as the longest heading in the document.
  - `"length"`: All underlines must have the specified fixed length. Requires the `length` property.
- `length` (number, required for `align: "length"`): The required length for underlines.

## 📚 Further Reading

- [CommonMark Spec: Setext Headings](https://spec.commonmark.org/0.31.2/#setext-headings)

## 👫 Related Rules

- [heading-casing](./heading-casing.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.17.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/setext-heading-underline-length.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/setext-heading-underline-length.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/setext-heading-underline-length)
