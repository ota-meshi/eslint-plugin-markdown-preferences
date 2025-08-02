---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/no-text-backslash-linebreak"
description: "disallow text backslash at the end of a line."
---

# markdown-preferences/no-text-backslash-linebreak

> disallow text backslash at the end of a line.

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- ⚙️ This rule is included in `plugin.configs.recommended`.
- 💡 Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

## 📖 Rule Details

This rule reports any text that contains a backslash (`\`) at the end of a line that is **not followed by any text on the next line**.

In Markdown, a backslash at the end of a line creates a hard line break only when there is text on the following line. However, when there is no text following the backslash (i.e., the line ends with a backslash and is followed by an empty line or end of file), the backslash is rendered as a literal backslash character, which is usually unintended.

This rule helps prevent confusion and ensures consistent formatting by detecting these cases where a backslash at the end of a line doesn't serve its intended purpose as a hard line break.

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/no-text-backslash-linebreak: 'error' -->

<!-- ✓ GOOD: Backslash creates a hard line break -->
foo\
bar

<!-- ✓ GOOD: No backslash needed for regular line breaks -->
foo

bar

<!-- ✗ BAD: Backslash followed by empty line renders as literal backslash -->
foo\

foo
bar\

<!-- ✗ BAD: Backslash at end of file renders as literal backslash -->
bar\
```

## 💡 When to use this rule

Use this rule when you want to:

- Prevent accidental literal backslash characters in your Markdown output
- Avoid confusion between intended hard line breaks and unintended literal backslashes

## 🔧 Options

This rule has no configuration options.

## 📚 Further reading

- [CommonMark Spec: Hard Line Breaks](https://spec.commonmark.org/0.31.2/#hard-line-breaks)

## 👫 Related rules

- [`hard-linebreak-style`](./hard-linebreak-style.md) - enforce hard line break style

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/no-text-backslash-linebreak.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/no-text-backslash-linebreak.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/no-text-backslash-linebreak)
