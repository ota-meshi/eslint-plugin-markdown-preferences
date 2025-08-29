---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/atx-headings-closing-sequence-length"
description: "enforce consistent length for the closing sequence (trailing #s) in ATX headings."
since: "v0.13.0"
---

# markdown-preferences/atx-headings-closing-sequence-length

> enforce consistent length for the closing sequence (trailing #s) in ATX headings.

- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

Enforces a consistent length for the closing sequence (trailing `#`s) in ATX headings (Markdown headings that start with `#`).
This rule does not enforce whether a closing sequence is present or absent. If a closing sequence exists, its length is checked. If the length is incorrect, the number of trailing `#`s is automatically adjusted by inserting or removing `#`s as needed. The closing sequence is never removed entirely, and headings without a closing sequence are ignored by this rule. Setext headings (those using `===` or `---`), and headings that consist only of `#` with no text, are also ignored.

**Mode: closing sequence length matches heading level (`"match-opening"`)**

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/atx-headings-closing-sequence-length: ["error", {"mode": "match-opening"}] -->
<!-- ✓ GOOD (with { "mode": "match-opening" }) -->
# Heading #
## Heading ##
<!-- ✗ BAD (with { "mode": "match-opening" }) -->
# Heading ###
## Heading #
```

<!-- prettier-ignore-end -->

**Mode: closing sequence length is always 2 (`{ "mode": "length", "length": 2 }`)**

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/atx-headings-closing-sequence-length: ["error", {"mode": "length", "length": 2}] -->
<!-- ✓ GOOD (with { "mode": "length", "length": 2 }) -->
# Heading ##
## Heading ##
<!-- ✗ BAD (with { "mode": "length", "length": 2 }) -->
# Heading #
## Heading ###
```

<!-- prettier-ignore-end -->

**Mode: all headings have a total line length of 30 (`{ "mode": "fixed-line-length", "length": 30 }`)**

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/atx-headings-closing-sequence-length: ["error", {"mode": "fixed-line-length", "length": 30}] -->
<!-- ✓ GOOD (with { "mode": "fixed-line-length", "length": 30 }) -->
# Short heading ##############
## Long heading ##############
<!-- ✗ BAD (with { "mode": "fixed-line-length", "length": 30 }) -->
# Short heading #
## Long heading ###
```

<!-- prettier-ignore-end -->

**Mode: all headings have the same number of trailing # as the first heading with a closing sequence (`"consistent"`)**

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/atx-headings-closing-sequence-length: ["error", {"mode": "consistent"}] -->
<!-- ✓ GOOD (with { "mode": "consistent" }) -->
# Heading #
## Heading #
<!-- ✗ BAD (with { "mode": "consistent" }) -->
# Heading #
## Heading ##
```

<!-- prettier-ignore-end -->

**Mode: all headings are padded with trailing # so that each heading line has the same length as the shortest line that can fully contain the longest heading in the document (`"consistent-line-length"`)**

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/atx-headings-closing-sequence-length: ["error", {"mode": "consistent-line-length"}] -->
<!-- ✓ GOOD (with { "mode": "consistent-line-length" }) -->
# Short ##########
## Long heading ##
<!-- ✗ BAD (with { "mode": "consistent-line-length" }) -->
# Short #
## Long heading ###
```

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/atx-headings-closing-sequence-length": [
    "error",
    {
      "mode": "match-opening",
      "length": null
    }
  ]
}
```

This rule accepts an object option with the following properties:

- `mode` (required):
  - `"match-opening"` (default): The number of trailing `#`s must match the number of leading `#`s (the heading level).
  - `"length"`: All ATX headings must have the specified number of trailing `#`s. Requires the `length` property.
  - `"consistent"`: All ATX headings in the document must have the same number of trailing `#` as the first ATX heading with a closing sequence.
  - `"consistent-line-length"`: All ATX headings must be padded with trailing `#` so that each heading line has the same length as the shortest line that can fully contain the longest heading in the document.
  - `"fixed-line-length"`: All ATX headings must have the specified total line length, by padding with trailing `#` as needed. Requires the `length` property.
- `length` (number, required for `"length"` and `"fixed-line-length"`): The required length for the closing sequence or the total line length.

## 📚 Further Reading

- [CommonMark Spec: ATX Headings]

[CommonMark Spec: ATX Headings]: https://spec.commonmark.org/0.31.2/#atx-headings

## 👫 Related Rules

- [markdown-preferences/atx-headings-closing-sequence](./atx-headings-closing-sequence.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.13.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/atx-headings-closing-sequence-length.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/atx-headings-closing-sequence-length.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/atx-headings-closing-sequence-length)
