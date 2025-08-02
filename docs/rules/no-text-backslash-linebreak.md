---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/no-text-backslash-linebreak"
description: "disallow text backslash at the end of a line"
---

# markdown-preferences/no-text-backslash-linebreak

> disallow text backslash at the end of a line

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- ⚙️ This rule is included in `plugin.configs.recommended`.
- 💡 Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

## 📖 Rule Details

This rule reports any text that contains a backslash (`\`) at the end of a line, which is not allowed in Markdown. This rule is useful to ensure that Markdown files do not contain unnecessary backslashes, which can lead to confusion or incorrect rendering.\
A backslash at the end of a line is rendered as a hard line break if the text continues on the next line, but is rendered as a text backslash if the text does not continue. In most cases, this is not what you intend.

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/no-text-backslash-linebreak: 'error' -->

<!-- ✓ GOOD -->
foo\
bar

foo

<!-- ✗ BAD -->
foo\
```

## 🔧 Options

Nothing.

## 📚 Further reading

- [CommonMark Spec: Hard Line Breaks](https://spec.commonmark.org/0.31.2/#hard-line-breaks)

## 👫 Related rules

- [xxx]

[xxx]: https://xxx

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/no-text-backslash-linebreak.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/no-text-backslash-linebreak.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/no-text-backslash-linebreak)
