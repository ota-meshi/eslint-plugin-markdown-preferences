---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/no-trailing-spaces"
description: "trailing whitespace at the end of lines in Markdown files."
---

# markdown-preferences/no-trailing-spaces

> trailing whitespace at the end of lines in Markdown files.

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule reports trailing spaces at the end of lines in Markdown files.

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/no-trailing-spaces: 'error' -->

<!-- ✓ GOOD -->
foo  
bar

<!-- ✗ BAD -->
foo  

foo  
bar  
```

## 🔧 Options

Nothing.

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/no-trailing-spaces.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/no-trailing-spaces.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/no-trailing-spaces)
