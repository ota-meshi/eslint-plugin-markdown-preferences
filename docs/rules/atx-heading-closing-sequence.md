---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/atx-heading-closing-sequence"
description: "enforce consistent use of closing sequence in ATX headings."
since: "v0.13.0"
---

# markdown-preferences/atx-heading-closing-sequence

> enforce consistent use of closing sequence in ATX headings.

- ⚙️ This rule is included in `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

ATX headings in Markdown are lines that start with 1–6 `#` characters, followed by a space and the heading text. According to the [CommonMark specification][CommonMark Spec: ATX Headings], ATX headings may optionally end with a "closing sequence"—one or more `#` characters, which must be preceded by a space or tab, and may be followed by spaces or tabs until the end of the line.

For example, all of the following are valid ATX headings:

<!-- prettier-ignore-start -->

```md
# Heading 1
# Heading 1 #
# Heading 1 ###   
```

<!-- prettier-ignore-end -->

The closing sequence is purely stylistic and has no effect on the rendered output. However, inconsistent use of closing sequences within a document or project can reduce readability and make automated formatting more difficult.

This rule enforces a consistent style for the presence or absence of closing sequences in ATX headings. You can configure it to either always require (`"always"`) or always forbid (`"never"`) the use of closing sequences.

**Why enforce this?**

- Consistency: Ensures all headings in your documentation or codebase follow the same style, improving readability and maintainability.
- Formatting: Helps avoid accidental trailing `#`s in heading content, which can be confusing or look like typos.
- Tooling: Makes it easier for automated tools and linters to process and format Markdown files.

**When is this rule useful?**

- When you want to enforce a uniform Markdown style across a team or project.
- When you want to prevent accidental or inconsistent use of closing `#`s in headings.
- When integrating with documentation generators or static site tools that expect a certain heading style.

Depending on your configuration, this rule will require (`"always"`) or forbid (`"never"`) the use of closing sequences in ATX headings.

### Examples

#### Default Configuration (`"never"`)

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/atx-heading-closing-sequence: "error" -->

<!-- ✓ GOOD -->

# Heading 1

## Heading 2

### Heading 3

<!-- ✗ BAD -->

# Heading 1 #

## Heading 2 ##

### Heading 3 ###
```

<!-- prettier-ignore-end -->

#### With `"always"` Configuration

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/atx-heading-closing-sequence: ["error", { "closingSequence": "always" }] -->

<!-- ✓ GOOD -->

# Heading 1 #

## Heading 2 ##

### Heading 3 ###

<!-- ✗ BAD -->

# Heading 1

## Heading 2

### Heading 3
```

<!-- prettier-ignore-end -->

## 🔧 Options

This rule has one option:

```json
{
  "markdown-preferences/atx-heading-closing-sequence": [
    "error",
    { "closingSequence": "never" }
  ]
}
```

- `closingSequence` ... Specify the closing sequence style for ATX headings. Default is `"never"`.
  - `"never"` ... Forbid closing sequence in ATX headings.
  - `"always"` ... Require closing sequence in ATX headings.

## 📚 Further Reading

- [CommonMark Spec: ATX Headings]

[CommonMark Spec: ATX Headings]: https://spec.commonmark.org/0.31.2/#atx-heading

## 👫 Related Rules

- [markdown-preferences/heading-casing](./heading-casing.md)
- [markdown-preferences/atx-heading-closing-sequence-length](./atx-heading-closing-sequence-length.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.13.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/atx-heading-closing-sequence.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/atx-heading-closing-sequence.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/atx-heading-closing-sequence)
