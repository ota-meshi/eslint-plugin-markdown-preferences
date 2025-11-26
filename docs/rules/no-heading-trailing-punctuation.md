---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/no-heading-trailing-punctuation"
description: "disallow trailing punctuation in headings."
---

# markdown-preferences/no-heading-trailing-punctuation

> disallow trailing punctuation in headings.

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- 💡 Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/latest/use/core-concepts/#rule-suggestions).

## 📖 Rule Details

This rule disallows ending Markdown headings with punctuation marks such as `.`, `,`, `;`, `:`, `!`, `。`, `、`, `，`, `；`, `：`, `！`, `｡`, or `､`. Headings in Markdown are typically used as section titles or anchors and are not meant to contain sentence-ending punctuation.

Adding punctuation at the end of headings can lead to inconsistent visual style, affect readability, and result in undesirable anchor IDs in rendered HTML (e.g., `#why-use-this-?` instead of `#why-use-this`).

### Examples

#### Default Configuration

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/no-heading-trailing-punctuation: 'error' -->

<!-- ✓ GOOD -->

# This is a heading

## Getting Started

### How to Use

<!-- ✗ BAD -->

# This is a heading.

## Getting Started:

### How to Use?
```

#### With Custom `punctuation` Option

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/no-heading-trailing-punctuation: ['error', { punctuation: '.!' }] -->

<!-- ✓ GOOD -->

# FAQ: Frequently Asked Questions

## What is this?

<!-- ✗ BAD -->

# This is a heading.

## Important!
```

### When Not to Use

- If your project uses headings that intentionally end with punctuation for stylistic reasons
- If you're working with documentation in languages that require specific punctuation conventions

## 🔧 Options

```json
{
  "markdown-preferences/no-heading-trailing-punctuation": [
    "error",
    {
      "punctuation": ".,;:!。、，；：！｡､"
    }
  ]
}
```

- `punctuation` (optional): A string of punctuation characters to disallow at the end of headings. Default: `".,;:!。、，；：！｡､"` (includes ASCII and CJK punctuation).

### `punctuation` (`string`)

A string containing punctuation characters that are not allowed at the end of headings. Each character in the string is treated as a disallowed punctuation mark.

**Default:** `".,;:!。、，；：！｡､"`

The default includes:

- ASCII: `.` `,` `;` `:` `!`
- CJK fullwidth: `。` `、` `，` `；` `：` `！`
- CJK halfwidth: `｡` `､`

Note: Question marks (`?` and `？`) are not included by default because they are commonly used in FAQ-style headings.

**Example:**

```json
{
  "punctuation": ".!?"
}
```

This configuration would only disallow periods (`.`), exclamation marks (`!`), and question marks (`?`) at the end of headings, while allowing colons (`:`), semicolons (`;`), and commas (`,`).

## 📚 Further Reading

- [markdownlint MD026 - Trailing punctuation in heading](https://github.com/DavidAnson/markdownlint/blob/main/doc/md026.md)

## 🔍 Implementation

<!-- eslint-disable markdown-links/no-dead-urls -- Auto generated -->

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/no-heading-trailing-punctuation.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/no-heading-trailing-punctuation.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/no-heading-trailing-punctuation)

<!-- eslint-enable markdown-links/no-dead-urls -- Auto generated -->
