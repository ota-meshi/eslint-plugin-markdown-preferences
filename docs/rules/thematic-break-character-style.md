---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/thematic-break-character-style"
description: "enforce consistent character style for thematic breaks (horizontal rules) in Markdown."
since: "v0.17.0"
---

# markdown-preferences/thematic-break-character-style

> enforce consistent character style for thematic breaks (horizontal rules) in Markdown.

- ⚙️ This rule is included in `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces a consistent character style for thematic breaks (horizontal rules) in Markdown. You can specify which character (`-`, `*`, or `_`) should be used for thematic breaks.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/thematic-break-character-style: 'error' -->

<!-- ✓ GOOD -->
---

<!-- ✗ BAD -->
***
___
```

<!-- prettier-ignore-end -->

## 🔧 Options

You can specify the preferred character for thematic breaks using the `style` option. The available values are `"-"`, `"*"`, and `"_"`.

```json
{
  "markdown-preferences/thematic-break-character-style": [
    "error",
    { "style": "-" }
  ]
}
```

If no option is specified, `"-"` is used by default.

## 📚 Further Reading

- [CommonMark Spec: Thematic Breaks](https://spec.commonmark.org/0.31.2/#thematic-breaks)
- [markdownlint: MD035 --- Horizontal rule style](https://github.com/DavidAnson/markdownlint/blob/main/doc/md035.md)

## 👫 Related Rules

- [markdown-preferences/thematic-break-length](./thematic-break-length.md)
- [markdown-preferences/thematic-break-sequence-pattern](./thematic-break-sequence-pattern.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.17.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/thematic-break-character-style.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/thematic-break-character-style.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/thematic-break-character-style)
