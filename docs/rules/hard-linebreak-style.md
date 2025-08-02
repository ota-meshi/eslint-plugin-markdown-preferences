---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/hard-linebreak-style"
description: "enforce consistent hard linebreak style."
since: "v0.1.0"
---

# markdown-preferences/hard-linebreak-style

> enforce consistent hard linebreak style.

- ⚙️ This rule is included in `plugin.configs.recommended`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces a consistent hard linebreak style in Markdown files.

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/hard-linebreak-style: 'error' -->

<!-- ✓ GOOD -->
foo\
baz

<!-- ✗ BAD -->
foo  
baz
```

## 🔧 Options

```json
{
  "markdown-preferences/hard-linebreak-style": [
    "error",
    {
      "style": "backslash" // or "space"
    }
  ]
}
```

- `style`: The style of hard linebreak to enforce. Can be either `"backslash"` or `"space"`. Defaults to `"backslash"`.
  - `"backslash"`: Enforces the use of backslashes (`\`) for hard linebreaks.
  - `"space"`: Enforces the use of two spaces for hard linebreaks.

## 📚 Further reading

- [CommonMark Spec: Hard Line Breaks](https://spec.commonmark.org/0.31.2/#hard-line-breaks)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.1.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/hard-linebreak-style.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/hard-linebreak-style.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/hard-linebreak-style)
