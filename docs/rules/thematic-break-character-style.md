---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/thematic-break-character-style"
description: "enforce a consistent character style for thematic breaks (horizontal rules) in Markdown."
---

# markdown-preferences/thematic-break-character-style

> enforce a consistent character style for thematic breaks (horizontal rules) in Markdown.

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
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

-

## 🔍 Implementation

<!-- eslint-disable markdown-links/no-dead-urls -- Auto generated -->

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/thematic-break-character-style.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/thematic-break-character-style.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/thematic-break-character-style)

<!-- eslint-enable markdown-links/no-dead-urls -- Auto generated -->
