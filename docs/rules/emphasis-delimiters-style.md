---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/emphasis-delimiters-style"
description: "enforce a consistent delimiter style for emphasis and strong emphasis"
---

# markdown-preferences/emphasis-delimiters-style

> enforce a consistent delimiter style for emphasis and strong emphasis

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces a consistent delimiter style for emphasis (`*text*`/`_text_`), strong emphasis (`**text**`/`__text__`), and strong+emphasis (`***text***`/`___text___`) in Markdown documents.

You can configure which delimiter to use for each type:

- `emphasis`: `*` or `_` (default: `*`)
- `strong`: `**` or `__` (default: `**`)
- `strongEmphasis`: You can specify allowed styles as a string (for `***text***` or `___text___`) or as an object `{ outer, inner }` for mixed delimiters. See Options below for details.

Any usage of a different delimiter will be reported as an error and can be automatically fixed.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/emphasis-delimiters-style: 'error' -->

<!-- ✓ GOOD -->

_emphasis_

**strong**

**_strongEmph_**

a*c*b <!-- remains as-is, not converted to a_c_b -->

<!-- ✗ BAD -->

*emphasis*

__strong__

***strongEmph***

___strongEmph___

_**strongEmph**_

__*strongEmph*__

**_strongEmph_**
```

<!-- prettier-ignore-end -->

## 🔧 Options

You can specify the preferred delimiter for each type using the options below. All options are optional.

```json
{
  "markdown-preferences/emphasis-delimiters-style": [
    "error",
    {
      "emphasis": "_", // "*" or "_" (default: "_")
      "strong": "**", // "**" or "__" (default: "**")
      // If omitted, strongEmphasis is automatically determined from the combination of emphasis/strong
      // To specify explicitly:
      "strongEmphasis": "***" // ***text***
      // or
      // "strongEmphasis": "___" // ___text___
      // "strongEmphasis": { "outer": "*", "inner": "__" } // *__text__*
      // "strongEmphasis": { "outer": "**", "inner": "_" } // **_text_**
      // "strongEmphasis": { "outer": "_", "inner": "**" } // _**text**_
      // "strongEmphasis": { "outer": "__", "inner": "*" } // __*text*__
    }
  ]
}
```

If no options are provided:

- `emphasis` defaults to underscore (`_`)
- `strong` defaults to asterisk (`**`)
- `strongEmphasis` is automatically determined from the `emphasis` and `strong` options as follows:
  - If either option contains `*`, then `*` is used as the outer delimiter and the other as the inner. In other words:
    - `emphasis: "_", strong: "**"` → `{ outer: "**", inner: "_" }` → `**_text_**`
    - `emphasis: "*", strong: "__"` → `{ outer: "*", inner: "__" }` → `*__text__*`
    - `emphasis: "*", strong: "**"` → `***` → `***text***`
    - `emphasis: "_", strong: "__"` → `___` → `___text___`
  - If `strongEmphasis` is explicitly specified, that value takes precedence.

**Note:**
If you specify `_` or `__` as a delimiter in any of the options (`emphasis`, `strong`, or `strongEmphasis`), intra-word emphasis (such as `a*c*b`) will **not** be converted to underscores. According to the [CommonMark specification][CommonMark Spec: Emphasis and strong emphasis], underscores do not create emphasis inside words. Only valid emphasis patterns will be checked and fixed.

### Details for the `strongEmphasis` Option

The `strongEmphasis` option specifies the style for combined emphasis and strong emphasis (e.g., `***text***` or `*__text__*`).

There are two ways to specify this option:

- As a string, such as `"***"` or `"___"`, to require the same delimiter for both outer and inner (e.g., `***text***`, `___text___`).
- As an object `{ "outer": string, "inner": string }` to require different delimiters for outer and inner (e.g., `*__text__*`, `**_text_**`, `_**text**_`, `__*text*__`).

Only one style can be specified; you cannot allow multiple styles at once.

**Examples:**

- `"***"` → `***text***`
- `"___"` → `___text___`
- `{ "outer": "*", "inner": "__" }` → `*__text__*`
- `{ "outer": "**", "inner": "_" }` → `**_text_**`
- `{ "outer": "_", "inner": "**" }` → `_**text**_`
- `{ "outer": "__", "inner": "*" }` → `__*text*__`

## 📚 Further Reading

- [CommonMark Spec: Emphasis and strong emphasis]

[CommonMark Spec: Emphasis and strong emphasis]: https://spec.commonmark.org/0.31.2/#emphasis-and-strong-emphasis

## 👫 Related Rules

None.

## 🔍 Implementation

<!-- eslint-disable markdown-links/no-dead-urls -- Auto generated -->

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/emphasis-delimiters-style.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/emphasis-delimiters-style.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/emphasis-delimiters-style)

<!-- eslint-enable markdown-links/no-dead-urls -- Auto generated -->
