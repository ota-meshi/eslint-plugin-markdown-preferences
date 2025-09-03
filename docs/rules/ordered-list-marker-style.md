---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/ordered-list-marker-style"
description: "enforce consistent ordered list marker style"
since: "v0.18.0"
---

# markdown-preferences/ordered-list-marker-style

> enforce consistent ordered list marker style

- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces a consistent ordered list marker style (e.g., always using `1.`, `1)`, or `1.` with a specific delimiter) throughout your Markdown project and restricts which marker styles are allowed. Inconsistent use of ordered list markers can make your documentation harder to read and maintain. This rule helps you enforce a consistent style for ordered list markers across your project, making your Markdown files cleaner and more professional.

### Why Use This Rule?

Markdown allows different marker styles for ordered lists, such as `1.`, `1)`, etc. Inconsistent use of these markers can make your documentation harder to read and maintain.

**Typical use cases:**

- You want all ordered lists in your documentation to use the same marker style (e.g., always `1.`).
- You want to restrict the allowed marker styles for ordered lists.
- You want to enforce different marker styles for different nesting levels.

### How This Rule Works

- You can specify which marker styles are allowed and their priority.
- The rule checks that each ordered list uses the correct marker style according to your configuration.
- You can override marker rules for specific nesting levels or parent markers.
- The `--fix` option can automatically correct marker style violations.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/ordered-list-marker-style: 'error' -->

<!-- ✓ GOOD (prefer "n.") -->
1. Item 1
2. Item 2

1) Item 3 <!-- ✓ GOOD ("n."の連続する別のリストの場合はもう一つの形式が許可されます) -->
2) Item 4

<!-- ✗ BAD (using "n)" which is not allowed) -->
1) Item 1
2) Item 2
```

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/ordered-list-marker-style": [
    "error",
    {
      "prefer": "n.",
      "overrides": [
        {
          "level": 2,
          "prefer": "n)"
        }
      ]
    }
  ]
}
```

- `prefer`: Specifies the prefer marker. Allowed values are `"n."`, or `"n)"`. This is used for the first list in a sequence or the first list at each level. Default is `"n."`.
- `overrides`: Allows you to override `prefer` for specific list levels or parent marker types. This is an array and can have multiple entries. Default is an empty array (`[]`).
  - `level`: The list level to override (integer, starting from 1).
  - `parentMarker`: The parent list marker to match for the override. Allowed values are `"n."`, `"n)"`, `"any"`, or `"bullet"`. If `"any"` is specified, it matches to all parent markers. If `"bullet"` is specified, it matches to bullet lists (unordered lists). If omitted, applies to all markers for that level (as `"any"`).
  - `prefer`: The prefer marker for that level.

### Examples

#### Specify Different Markers for Level 2

In the following example, `"n."` is preferred by default, but for level 2 lists, `"n)"` is preferred.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/ordered-list-marker-style: [
    "error",
    {
      "prefer": "n.",
      "overrides": [
        {
          "level": 2,
          "prefer": "n)"
        }
      ]
    }
  ] -->

<!-- ✓ GOOD -->
1. Item 1
   1) Item 1.1
   2) Item 1.2
2. Item 2
   1) Item 2.1
   2) Item 2.2
   1. Item 2.3
   2. Item 2.4

<!-- ✗ BAD -->
1. Item 1
   1. Item 1.1
   2. Item 1.2
2. Item 2
   1. Item 2.1
   2. Item 2.2
   1) Item 2.3
   2) Item 2.4
```

<!-- prettier-ignore-end -->

#### Specify Different Markers for Level 2 Depending on Parent Marker

In the following example, `"n."` is preferred by default, but for level 2 lists, if the parent marker is `"n."`, then `"n)"` is preferred; if the parent marker is `"n)"`, then `"n."` is preferred.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/ordered-list-marker-style: [
    "error",
    {
      "prefer": "n.",
      "overrides": [
        {
          "level": 2,
          "parentMarker": "n.",
          "prefer": "n)"
        },
        {
          "level": 2,
          "parentMarker": "n)",
          "prefer": "n."
        }
      ]
    }
  ] -->

<!-- ✓ GOOD -->
1. Item 1
   1) Item 1.1
   2) Item 1.2
   1. Item 1.3
   2. Item 1.4
1) Item 2
   1. Item 2.1
   2. Item 2.2
   1) Item 2.3
   2) Item 2.4

<!-- ✗ BAD -->
1. Item 1
   1. Item 1.1
   2. Item 1.2
   1) Item 1.3
   2) Item 1.4
1) Item 2
   1) Item 2.1
   2) Item 2.2
   1. Item 2.3
   2. Item 2.4
```

<!-- prettier-ignore-end -->

## 📚 Further Reading

- [CommonMark: List items](https://spec.commonmark.org/0.31.2/#list-items)

## 👫 Related Rules

- [markdown-preferences/bullet-list-marker-style](./bullet-list-marker-style.md)
- [markdown-preferences/ordered-list-marker-sequence](./ordered-list-marker-sequence.md)
- [markdown-preferences/ordered-list-marker-start](./ordered-list-marker-start.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.18.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/ordered-list-marker-style.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/ordered-list-marker-style.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/ordered-list-marker-style)
