---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/code-fence-spacing"
description: "require or disallow spacing between opening code fence and language identifier"
---

# markdown-preferences/code-fence-spacing

> require or disallow spacing between opening code fence and language identifier

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces consistent spacing between the opening code fence (e.g. ` ``` ` or `~~~`) and the language identifier in fenced code blocks.
You can require a space (`"always"`) or disallow it (`"never"`).
By default, spaces are disallowed.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

````md
<!-- eslint markdown-preferences/code-fence-spacing: 'error' -->

<!-- ✓ GOOD -->

```js
console.log("hello")
```


<!-- ✗ BAD -->

``` js
console.log("hello")
```
````

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/code-fence-spacing": [
    "error",
    {
      "space": "never"
    }
  ]
}
```

- `space` (string, default: `"never"`)
  - `"always"` requires a space between the opening code fence and the language identifier.
  - `"never"` disallows spaces between the opening code fence and the language identifier.

## 📚 Further Reading

- [CommonMark Spec: Fenced Code Blocks](https://spec.commonmark.org/0.31.2/#fenced-code-blocks)

## 👫 Related Rules

- [markdown-preferences/code-fence-length](./code-fence-length.md)
- [markdown-preferences/code-fence-style](./code-fence-style.md)
- [markdown-preferences/prefer-fenced-code-blocks](./prefer-fenced-code-blocks.md)

## 🔍 Implementation

<!-- eslint-disable markdown-links/no-dead-urls -- Auto generated -->

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/code-fence-spacing.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/code-fence-spacing.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/code-fence-spacing)

<!-- eslint-enable markdown-links/no-dead-urls -- Auto generated -->
