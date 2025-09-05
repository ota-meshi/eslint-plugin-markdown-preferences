---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/strikethrough-delimiters-style"
description: "enforce a consistent delimiter style for strikethrough (GFM extension)"
---

# markdown-preferences/strikethrough-delimiters-style

> Enforce a consistent delimiter style for strikethrough (GFM extension)

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces a consistent delimiter style for strikethrough in Markdown documents.

**Note:** Strikethrough is _not_ part of the [CommonMark](https://spec.commonmark.org/) specification, but is supported as an [extension in GitHub Flavored Markdown (GFM)][GitHub Flavored Markdown: Strikethrough (extension)].

In GFM, only the tilde (`~`) character is valid for strikethrough. Both single and double tildes (`~text~` and `~~text~~`) are allowed, and which to use is determined by this rule's option.

This rule reports and can automatically fix the use of a tilde delimiter count that does not match the configured option. Other symbols are not supported.

### Examples

#### `~~` Style (Default)

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/strikethrough-delimiters-style: 'error' -->

<!-- ✓ GOOD (when option: { "delimiter": "~~" }) -->
~~strikethrough~~

<!-- ✗ BAD (when option: { "delimiter": "~~" }) -->
~strikethrough~
```

<!-- prettier-ignore-end -->

#### `~` Style (Default)

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/strikethrough-delimiters-style: ['error', { "delimiter": "~" }] -->

<!-- ✓ GOOD (when option: { "delimiter": "~" }) -->
~strikethrough~

<!-- ✗ BAD (when option: { "delimiter": "~" }) -->
~~strikethrough~~
```

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/strikethrough-delimiters-style": [
    "error",
    { "delimiter": "~~" }
  ]
}
```

This rule has one option:

- `delimiter`: Specify the delimiter to use for strikethrough. Accepts `"~~"` (default) or `"~"`.
  - `"~~"`: Only double tilde (`~~text~~`) is allowed (default, CommonMark/GFM standard)
  - `"~"`: Allow single tilde (`~text~`) as strikethrough (for non-standard/extended Markdown)

## 📚 Further Reading

- [GitHub Flavored Markdown: Strikethrough (extension)]

[GitHub Flavored Markdown: Strikethrough (extension)]: https://github.github.com/gfm/#strikethrough-extension-

## 👫 Related Rules

- [markdown-preferences/emphasis-delimiters-style](./emphasis-delimiters-style.md) - enforce a consistent delimiter style for emphasis and strong emphasis

## 🔍 Implementation

<!-- eslint-disable markdown-links/no-dead-urls -- Auto generated -->

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/strikethrough-delimiters-style.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/strikethrough-delimiters-style.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/strikethrough-delimiters-style)

<!-- eslint-enable markdown-links/no-dead-urls -- Auto generated -->
