---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/no-text-backslash-linebreak"
description: "disallow text backslash at the end of a line."
since: "v0.2.0"
---

# markdown-preferences/no-text-backslash-linebreak

> disallow text backslash at the end of a line.

- ⚙️ This rule is included in `plugin.configs.recommended` and `plugin.configs.standard`.
- 💡 Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/latest/use/core-concepts/#rule-suggestions).

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

## 💡 When to Use This Rule

Use this rule when you want to:

- Prevent accidental literal backslash characters in your Markdown output
- Avoid confusion between intended hard line breaks and unintended literal backslashes

## 🔧 Options

This rule has no options.

## 📚 Further Reading

- [CommonMark Spec: Hard Line Breaks](https://spec.commonmark.org/0.31.2/#hard-line-breaks)

## 👫 Related Rules

- [markdown-preferences/hard-linebreak-style](./hard-linebreak-style.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.2.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/no-text-backslash-linebreak.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/no-text-backslash-linebreak.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/no-text-backslash-linebreak)
