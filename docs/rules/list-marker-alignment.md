---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/list-marker-alignment"
description: "enforce consistent alignment of list markers"
since: "v0.15.0"
---

# markdown-preferences/list-marker-alignment

> enforce consistent alignment of list markers

- ⚙️ This rule is included in `plugin.configs.recommended`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces consistent alignment (indentation) of list markers within the same list and at the same nesting level. All list items at the same level should start with the same amount of indentation before their markers.

**What this rule checks:**

- Bullet lists (unordered lists) (`-`, `*`, `+` markers)
- Ordered lists (`1.`, `2.`, etc.)
- Lists inside blockquotes
- Nested lists (each nesting level is checked independently)

**What this rule does:**

- Detects inconsistent spacing before list markers
- Automatically fixes alignment issues when using `--fix`

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/list-marker-alignment: 'error' -->

<!-- ✓ GOOD: Consistent alignment within each list level -->
- Item 1
- Item 2
  - Nested item 1
  - Nested item 2
- Item 3

1. First item
2. Second item
3. Third item

> - Blockquote list item 1
> - Blockquote list item 2

<!-- ✗ BAD: Inconsistent alignment -->
- Item 1
 - Item 2  <!-- Extra space before marker -->
- Item 3
  - Nested item 1
   - Nested item 2  <!-- Extra space before marker -->

1. First item
 2. Second item  <!-- Extra space before marker -->
3. Third item
   1. Nested item 1
  2. Nested item 2  <!-- Missing space before marker -->

> - Blockquote list item 1
>  - Blockquote list item 2  <!-- Extra space after > -->
```

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/list-marker-alignment": [
    "error",
    {
      "align": "left"
    }
  ]
}
```

- `align` (default: `"left"`): Specifies the alignment position. This option only affects ordered lists.
  - `"left"`: Align list markers to the left (align the start of markers)
  - `"right"`: Align list markers to the right (align the end of markers)

### `align: "left"` (Default)

This is the default behavior. List markers are aligned to the left.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/list-marker-alignment: ['error', { align: "left" }] -->

<!-- ✓ GOOD -->

1. Item 1
10. Item 10
100. Item 100

<!-- ✗ BAD -->

  1. Item 1
 10. Item 10
100. Item 100
```

<!-- prettier-ignore-end -->

### `align: "right"`

List markers are aligned to the right, which is useful for ordered lists with varying digit counts.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/list-marker-alignment: ['error', { align: "right" }] -->

<!-- ✓ GOOD -->

  1. Item 1
 10. Item 10
100. Item 100

<!-- ✗ BAD -->

1. Item 1
10. Item 10
100. Item 100
```

<!-- prettier-ignore-end -->

## 📚 Further Reading

- [CommonMark Spec: List Items](https://spec.commonmark.org/0.31.2/#list-items)

## 👫 Related Rules

- [markdown-preferences/ordered-list-marker-sequence](./ordered-list-marker-sequence.md)
- [markdown-preferences/ordered-list-marker-start](./ordered-list-marker-start.md)
- [markdown-preferences/blockquote-marker-alignment](./blockquote-marker-alignment.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.15.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/list-marker-alignment.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/list-marker-alignment.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/list-marker-alignment)
