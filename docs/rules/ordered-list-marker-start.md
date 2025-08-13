---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/ordered-list-marker-start"
description: "enforce that ordered list markers start with 1 or 0"
since: "v0.12.0"
---

# markdown-preferences/ordered-list-marker-start

> enforce that ordered list markers start with 1 or 0

- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.
- 💡 Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

## 📖 Rule Details

This rule enforces that ordered lists in Markdown start with a specific number (`1` or `0`). It helps ensure consistency in documentation and prevents accidental mistakes in list numbering.

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/ordered-list-marker-start: 'error' -->

<!-- ✓ GOOD -->

1. foo
2. bar
3. baz

<!-- ✗ BAD -->

0. foo
1. bar
2. baz
```

If you want to allow lists to start with 0, use the option `{ "start": 0 }`:

```md
<!-- eslint markdown-preferences/ordered-list-marker-start: ["error", {"start":0}] -->

<!-- ✓ GOOD -->

0. foo
1. bar
2. baz

<!-- ✗ BAD -->

1. foo
2. bar
3. baz
```

## 🔧 Options

```json
{
  "markdown-preferences/ordered-list-marker-start": [
    "error",
    {
      "start": 1
    }
  ]
}
```

- `start` ... Enforces that ordered lists must start with the specified value (`0` or `1`). If set to `1`, lists must start with `1.`. If set to `0`, lists must start with `0.`. Defaults to `1`.

## 📚 Further Reading

- [CommonMark: List items](https://spec.commonmark.org/0.31.2/#list-items)

## 👫 Related Rules

- [markdown-preferences/ordered-list-marker-sequence](./ordered-list-marker-sequence.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.12.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/ordered-list-marker-start.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/ordered-list-marker-start.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/ordered-list-marker-start)
