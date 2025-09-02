---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/bullet-list-marker-style"
description: "enforce consistent bullet list (unordered list) marker style"
---

# markdown-preferences/bullet-list-marker-style

> enforce consistent bullet list (unordered list) marker style

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces a consistent bullet list marker style (either `-`, `*`, or `+`) throughout your Markdown project and restricts which markers are allowed. Inconsistent use of these markers can make your documentation harder to read and maintain. This rule helps you enforce a consistent style for bullet list markers across your project, making your Markdown files cleaner and more professional.

### Why Use This Rule?

Markdown allows three different markers for bullet lists: `-`, `*`, and `+`. Inconsistent use of these markers can make your documentation harder to read and maintain.

**Typical use cases:**

- You want all bullet lists in your documentation to use the same marker (e.g., always `-`).
- You want to allow two markers, but control their order for consecutive lists.
- You want to enforce different markers for different nesting levels.

### How This Rule Works

- You can specify which markers are allowed and their priority.
- The rule checks that each list uses the correct marker according to your configuration.
- If two or more consecutive (non-nested) lists appear, they must use different markers (per the Markdown spec).
- You can override marker rules for specific nesting levels or parent markers.
- The `--fix` option can automatically correct marker violations.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/bullet-list-marker-style: 'error' -->

<!-- ✓ GOOD (e.g., allowing "-" and "*" and using them for consecutive lists) -->
- Item 1
- Item 2

* Item 3
* Item 4

<!-- ✗ BAD (using "+" which is not allowed) -->
+ Item 1
+ Item 2

* Item 3 <!-- ✗ BAD: violates priority order -->
* Item 4 <!-- ✗ BAD: violates priority order -->
```

<!-- prettier-ignore-end -->

## 🔧 Options

This rule allows you to specify `primary` (highest-priority marker), `secondary` (second marker), and `override` (per-level overrides).
You can set `"any"` for `secondary` to allow any marker at that position.

```json
{
  "markdown-preferences/bullet-list-marker-style": [
    "error",
    {
      "primary": "-",
      "secondary": "*",
      "overrides": [
        {
          "level": 2,
          "primary": "*",
          "secondary": "any"
        }
      ]
    }
  ]
}
```

- `primary`: Specifies the highest-priority marker. Allowed values are `"-"`, `"*"`, or `"+"`. This is used for the first list in a sequence or the first list at each level. Default is `"-"`.
- `secondary`: Specifies the marker for the second list in a sequence. Allowed values are `"-"`, `"*"`, `"+"`, or `"any"`. If `"any"` is specified, any marker except `primary` is allowed. Specifying the same value as `primary` is an error. If omitted, a marker not specified as `primary` will be used by default.
- `overrides`: Allows you to override `primary`/`secondary` for specific list levels or parent marker types. This is an array and can have multiple entries. Default is an empty array (`[]`).
  - `level`: The list level to override (integer, starting from 1).
  - `parentMarker`: The parent list marker to match for the override. Allowed values are `"-"`, `"*"`, `"+"`, `"any"`, or `"ordered"`. If `"any"` is specified, it matches to all parent markers. If `"ordered"` is specified, it matches to ordered lists. If omitted, applies to all markers for that level (as `"any"`).
  - `primary`: The highest-priority marker for that level.
  - `secondary`: The second marker for that level.

### Examples

#### Specify Different Markers for Level 2

In the following example, `"-"` and `"*"` are allowed by default, but for level 2 lists, `"*"` and `"+"` are allowed.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/bullet-list-marker-style: [
    "error",
    {
      "primary": "-",
      "secondary": "*",
      "overrides": [
        {
          "level": 2,
          "primary": "*",
          "secondary": "+"
        }
      ]
    }
  ] -->

<!-- ✓ GOOD -->
- Item 1
  * Item 1.1
  * Item 1.2
- Item 2
  * Item 2.1
  * Item 2.2
  + Item 2.3
  + Item 2.4

<!-- ✗ BAD -->
- Item 1
  - Item 1.1
  - Item 1.2
- Item 2
  + Item 2.1
  + Item 2.2
  * Item 2.3
  * Item 2.4
```

<!-- prettier-ignore-end -->

#### Specify Different Markers for Level 2 Depending on Parent Marker

In the following example, `"-"` and `"*"` are allowed by default, but for level 2 lists, if the parent marker is `"-"`, then `"*"` and `"+"` are allowed; if the parent marker is `"*"`, then `"-"` and `"+"` are allowed.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/bullet-list-marker-style: [
    "error",
    {
      "primary": "-",
      "secondary": "*",
      "overrides": [
        {
          "level": 2,
          "parentMarker": "-",
          "primary": "*",
          "secondary": "+"
        },
        {
          "level": 2,
          "parentMarker": "*",
          "primary": "-",
          "secondary": "+"
        }
      ]
    }
  ] -->

<!-- ✓ GOOD -->
- Item 1
  * Item 1.1
  * Item 1.2
  + Item 1.3
  + Item 1.4
* Item 2
  - Item 2.1
  - Item 2.2
  + Item 2.3
  + Item 2.4

<!-- ✗ BAD -->
- Item 1
  - Item 1.1
  - Item 1.2
  * Item 1.3
  * Item 1.4
* Item 2
  * Item 2.1
  * Item 2.2
  - Item 2.3
  - Item 2.4
```

<!-- prettier-ignore-end -->

## 📚 Further Reading

- [CommonMark: List items](https://spec.commonmark.org/0.31.2/#list-items)

## 👫 Related Rules

- [markdown-preferences/ordered-list-marker-sequence](./ordered-list-marker-sequence.md)
- [markdown-preferences/ordered-list-marker-start](./ordered-list-marker-start.md)
- [markdown-preferences/ordered-list-marker-style](./ordered-list-marker-style.md)

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/bullet-list-marker-style.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/bullet-list-marker-style.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/bullet-list-marker-style)
