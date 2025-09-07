---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/thematic-break-length"
description: "enforce consistent length for thematic breaks (horizontal rules) in Markdown."
since: "v0.17.0"
---

# markdown-preferences/thematic-break-length

> enforce consistent length for thematic breaks (horizontal rules) in Markdown.

- ⚙️ This rule is included in `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule ensures that all thematic breaks (e.g., `---`, `***`, or `___`) have a consistent number of characters, improving readability and style consistency across your documentation.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/thematic-break-length: 'error' -->

<!-- ✓ GOOD -->
---
---
---

***
***
***

___
___
___

<!-- ✗ BAD -->
----
------
-----

****
******
*****

____
______
_____
```

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/thematic-break-length": [
    "error",
    {
      "length": 3
    }
  ]
}
```

- `length`: The desired length for all thematic breaks (default: 3).

## 📚 Further Reading

- [CommonMark Spec: Thematic breaks](https://spec.commonmark.org/0.31.2/#thematic-breaks)

## 👫 Related Rules

- [markdown-preferences/thematic-break-character-style](./thematic-break-character-style.md)
- [markdown-preferences/thematic-break-sequence-pattern](./thematic-break-sequence-pattern.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.17.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/thematic-break-length.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/thematic-break-length.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/thematic-break-length)
