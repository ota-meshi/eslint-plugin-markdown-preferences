---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/prefer-linked-words"
description: "enforce the specified word to be a link."
---

# markdown-preferences/prefer-linked-words

> enforce the specified word to be a link.

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule aims to enforce words that you always want to be links.

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/prefer-linked-words: ["error", { "words": { "foo": "https://example.com/foo" } }] -->

<!-- ✓ GOOD -->
- [foo](https://example.com/foo)

<!-- ✗ BAD -->
- foo
```

## 🔧 Options

```json
{
  "markdown-preferences/prefer-linked-words": [
    "error",
    {
      "words": {
        "foo": "https://example.com/foo",
        "bar": "https://example.com/bar"
      }
    }
  ]
}
```

- `words`
  - Object style: An object where the keys are the words you want to link, and the values are the URLs to link to.
  - Array style: An array of words that should always be made into links. Auto-fix is not available.

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/prefer-linked-words.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/prefer-linked-words.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/prefer-linked-words)
