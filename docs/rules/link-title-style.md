---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/link-title-style"
description: "enforce a consistent style for link titles"
since: "v0.22.0"
---

# markdown-preferences/link-title-style

> enforce a consistent style for link titles

- ⚙️ This rule is included in `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fix-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces a consistent style for link titles in Markdown links, images, and link definitions.
You can specify the style of the title using double quotes (`"title"`), single quotes (`'title'`), or parentheses (`(title)`).
By default, double quotes are enforced. If the title contains the enforced delimiter and `avoidEscape` is enabled (default), the rule will not force a change that would require escaping.

### Examples

#### With `"double"` Option (Default)

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/link-title-style: 'error' -->

<!-- ✓ GOOD -->
- [example](/url "title")

<!-- ✗ BAD -->
- [example](/url 'title')
- [example](/url (title))
```

<!-- prettier-ignore-end -->

#### With `"single"` Option

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/link-title-style: ["error", { "style": "single" }] -->

<!-- ✓ GOOD -->
- [example](/url 'title')

<!-- ✗ BAD -->
- [example](/url "title")
- [example](/url (title))
```

<!-- prettier-ignore-end -->

#### With `"parentheses"` Option

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/link-title-style: ["error", { "style": "parentheses" }] -->

<!-- ✓ GOOD -->
- [example](/url (title))

<!-- ✗ BAD -->
- [example](/url "title")
- [example](/url 'title')
```

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/link-title-style": [
    "error",
    {
      "style": "double",
      "avoidEscape": true
    }
  ]
}
```

### `style`

Type: `"double" | "single" | "parentheses"`\
Default: `"double"`

Specify the style of the link title:

- `"double"`: Enforce double quotes (`"title"`)
- `"single"`: Enforce single quotes (`'title'`)
- `"parentheses"`: Enforce parentheses (`(title)`)

### `avoidEscape`

Type: `boolean`\
Default: `true`

If `true`, the rule will not enforce a style if it would require escaping the delimiter inside the title.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/link-title-style: ["error", { "avoidEscape": true }] -->

<!-- ✓ GOOD -->
- [example](/url "title")
- [example](/url '"double" quotes inside single quotes')
- [example](/url ("double" quotes inside parentheses))

<!-- ✗ BAD -->
- [example](/url 'title')
- [example](/url (title))
```

<!-- prettier-ignore-end -->

## 📚 Further Reading

- [CommonMark Spec: Links](https://spec.commonmark.org/0.31.2/#links)
- [CommonMark Spec: Images](https://spec.commonmark.org/0.31.2/#images)
- [CommonMark Spec: Link reference definitions](https://spec.commonmark.org/0.31.2/#link-reference-definitions)

## 👫 Related Rules

- [markdown-preferences/link-destination-style](./link-destination-style.md)
- [markdown-preferences/link-bracket-newline](./link-bracket-newline.md)
- [markdown-preferences/link-bracket-spacing](./link-bracket-spacing.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.22.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/link-title-style.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/link-title-style.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/link-title-style)
