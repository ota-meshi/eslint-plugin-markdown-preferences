---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/thematic-break-sequence-pattern"
description: "enforce consistent repeating patterns for thematic breaks (horizontal rules) in Markdown."
---

# markdown-preferences/thematic-break-sequence-pattern

> enforce consistent repeating patterns for thematic breaks (horizontal rules) in Markdown.

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule reports thematic breaks (horizontal rules) that do not match the preferred repeating sequence pattern. For example, if the preferred pattern is a sequence of hyphens (`---`), then space-separated patterns like `- - -` or `-- -- --` will be reported as inconsistent. This helps maintain consistency of thematic break patterns throughout your Markdown documents.

Specifically:

- If the preferred pattern is a sequence of marks, then `---` and `-----` are allowed, while `- - -` and `-- -- --` are reported as inconsistent.
- If the preferred pattern is a repetition of "mark + space", then `- - -` and `- - - - -` are allowed, while `---` and `-- -- --` are reported as inconsistent.

This rule only checks the repeating pattern and ignores the character used (`-`, `*`, or `_`). For example, `---` and `***` are treated as the same repeating pattern.
The character style (which character to use: hyphen, asterisk, or underscore) is checked by the [markdown-preferences/thematic-break-character-style] rule. For full consistency, use both rules together.

Also, this rule does not check the length (number of repetitions) of the thematic break. For example, if the preferred pattern is `"-"`, both `---` and `-----` are treated as matching patterns and will not be reported. If you want to control the length of thematic breaks, use the [markdown-preferences/thematic-break-length] rule.
Note that there may be conflicts with the options of the [markdown-preferences/thematic-break-length] rule. For example, if the preferred pattern is `"- "`, a minimum length of 5 (`- - -`) is required, so specifying a length of 3 in the [markdown-preferences/thematic-break-length] rule may cause a conflict.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/thematic-break-sequence-pattern: 'error' -->

<!-- ✓ GOOD -->

---

***

___

<!-- ✗ BAD -->

- - -

-- -- --

* * *

_ _ _
```

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/thematic-break-sequence-pattern": [
    "error",
    { "pattern": "-" }
  ]
}
```

- `pattern`: The preferred repeating pattern for thematic breaks. It must be a string containing only `-`, `*`, `_` and spaces.

### `pattern`

Specifies the repeating pattern for thematic breaks. The value must be the minimal repeating pattern, such as `"-"` or `"- "`.

For example, if you specify `"- - -"`, any sequence that repeats `- - -` is allowed, so both `- - -` and `- - -- - -` are considered valid.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/thematic-break-sequence-pattern: ["error", { "pattern": "-" }] -->

<!-- ✓ GOOD -->

---
***
___

<!-- ✗ BAD -->

- - -
* * *
_ _ _
```

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/thematic-break-sequence-pattern: ["error", { "pattern": "- " }] -->

<!-- ✓ GOOD -->

- - -
* * *
_ _ _

<!-- ✗ BAD -->

---
***
___

-- -- --
```

<!-- prettier-ignore-end -->

## 📚 Further Reading

- [CommonMark Spec: Thematic breaks](https://spec.commonmark.org/0.31.2/#thematic-breaks)

## 👫 Related Rules

- [markdown-preferences/thematic-break-character-style]
- [markdown-preferences/thematic-break-length]

[markdown-preferences/thematic-break-character-style]: ./thematic-break-character-style.md
[markdown-preferences/thematic-break-length]: ./thematic-break-length.md

## 🔍 Implementation

<!-- eslint-disable markdown-links/no-dead-urls -- Auto generated -->

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/thematic-break-sequence-pattern.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/thematic-break-sequence-pattern.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/thematic-break-sequence-pattern)

<!-- eslint-enable markdown-links/no-dead-urls -- Auto generated -->
