---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/sort-definitions"
description: "enforce a specific order for link definitions and footnote definitions"
since: "v0.8.0"
---

# markdown-preferences/sort-definitions

> enforce a specific order for link definitions and footnote definitions

- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces a specific order for link definitions (`[label]: URL`) and footnote definitions (`[^label]: text`). By default, link definitions are sorted alphabetically first, followed by footnote definitions sorted alphabetically.

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/sort-definitions: 'error' -->

<!-- ✓ GOOD -->
See [ESLint] and [TypeScript] for details.
Also check the footnote[^first] and [^second].

[ESLint]: https://eslint.org
[TypeScript]: https://www.typescriptlang.org
[^first]: This is the first footnote
[^second]: This is the second footnote

<!-- ✗ BAD -->
See [TypeScript] and [ESLint] for details.
Also check the footnote[^second] and [^first].

[TypeScript]: https://www.typescriptlang.org
[ESLint]: https://eslint.org
[^second]: This is the second footnote
[^first]: This is the first footnote
```

## 🔧 Options

You can configure the order and sorting behavior for definitions.

```json
{
  "markdown-preferences/sort-definitions": [
    "error",
    {
      "order": [
        { "match": "!/^\\[\\^/u", "sort": "alphabetical" },
        { "match": "/./u", "sort": "alphabetical" }
      ]
    }
  ]
}
```

### `order`

An array that defines the order of definition groups and how they should be sorted. Each element can be:

- A **string**: A literal match pattern for specific definition labels
- An **array of strings**: Multiple literal match patterns
- An **object** with:
  - `match`: A pattern to match definitions (string, array of strings, or regex)
  - `sort`: How to sort matched definitions (`"alphabetical"` or `"ignore"`)

#### Default Configuration

By default, the rule uses this configuration:

```json
{
  "order": [
    { "match": "!/^\\[\\^/u", "sort": "alphabetical" },
    { "match": "/./u", "sort": "alphabetical" }
  ]
}
```

This means:

1. Link definitions (not starting with `[^`) are sorted alphabetically first
2. All remaining definitions (including footnotes) are sorted alphabetically after

#### Pattern Matching

- **Literal strings**: Match definition labels exactly (e.g., `"api-docs"`)
- **Regular expressions**: Use `/pattern/flags` format (e.g., `"/^\\[\\^/u"` for footnotes)
- **Negated patterns**: Prefix with `!` to exclude matches (e.g., `"!/^\\[\\^/u"` for non-footnotes)
- **URL matching**: Match against the full definition text including URL

#### Examples

**Footnotes first, then links alphabetically:**

```json
{
  "order": [
    { "match": "/^\\[\\^/u", "sort": "alphabetical" },
    { "match": "!/^\\[\\^/u", "sort": "alphabetical" }
  ]
}
```

**Specific definitions first:**

```json
{
  "order": [
    "alpha-link",
    { "match": "/./u", "sort": "alphabetical" }
  ]
}
```

**Group by URL pattern:**

```json
{
  "order": [
    { "match": "https://github.com/", "sort": "alphabetical" },
    { "match": "/./u", "sort": "alphabetical" }
  ]
}
```

## 📚 Further reading

- [CommonMark Spec: Link Reference Definitions](https://spec.commonmark.org/0.31.2/#link-reference-definitions)
- [GitHub Flavored Markdown: Link Reference Definitions](https://github.github.com/gfm/#link-reference-definitions)

## 👫 Related rules

- [markdown-preferences/definitions-last](./definitions-last.md)
- [markdown-preferences/prefer-link-reference-definitions](./prefer-link-reference-definitions.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.8.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/sort-definitions.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/sort-definitions.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/sort-definitions)
