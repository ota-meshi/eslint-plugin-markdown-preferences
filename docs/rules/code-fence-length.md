---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/code-fence-length"
description: "enforce consistent code fence length in fenced code blocks."
since: "v0.20.0"
---

# markdown-preferences/code-fence-length

> enforce consistent code fence length in fenced code blocks.

- ⚙️ This rule is included in `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces a consistent length for code fences (` ``` `, `~~~`) in fenced code blocks. The opening and closing fence lengths must always match, regardless of configuration. This improves readability and consistency in Markdown files.

### What This Rule Checks

- The opening and closing code fence lengths must always match. (Always reported if not matched)
- You can enforce a fixed fence length (e.g. always 3 backticks)
- You can specify fallback behavior if the fixed length cannot be used (e.g. due to content)
- You can override the length per language (info string)

### Examples

**Default (`length: 3`)**

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

`````md
<!-- eslint markdown-preferences/code-fence-length: ['error', { "length": 3 }] -->

<!-- ✓ GOOD -->
```js
console.log("ok")
```

<!-- ✗ BAD -->
````js
console.log("bad")
````

<!-- ✗ BAD (mismatched) -->
```js
console.log("bad")
````
`````

<!-- prettier-ignore-end -->

**With `fallbackLength: "minimum"`**

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

``````md
<!-- eslint markdown-preferences/code-fence-length: ['error', { "length": 3, "fallbackLength": "minimum" }] -->

<!-- ✓ GOOD (content contains 3 backticks, so fence is 4) -->
````md
```
code
```
````

<!-- ✗ BAD (should use 4) -->
`````md
```
code
```
`````
``````

<!-- prettier-ignore-end -->

**With `overrides`**

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

`````md
<!-- eslint markdown-preferences/code-fence-length: ['error', { "length": 3, "overrides": [{ "lang": "md", "length": 4 }] }] -->

<!-- ✓ GOOD (markdown code block uses 4) -->
````md
```js
console.log("sample")
```
````

<!-- ✗ BAD (should use 4 for md) -->
```md
# Sample
```
<!-- ✓ GOOD (js code block uses 3) -->
```js
console.log("js")
```

`````

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/code-fence-length": [
    "error",
    {
      "length": 3,
      "fallbackLength": "minimum",
      "overrides": [{ "lang": "md", "length": 4, "fallbackLength": "minimum" }]
    }
  ]
}
```

- **`length`** (`number`, default: `3`):\
  Enforces a fixed code fence length (must be 3 or greater). The specified number of backticks (`` ` ``) or tildes (`~`) will be used for code fences.
- **`fallbackLength`** (`number` | `"minimum"` | `"as-is"`, default: `"minimum"`):\
  Specifies the fallback behavior if the fixed `length` cannot be used (for example, if the code block content contains a sequence of backticks/tilde of the same or greater length).
  - `"minimum"`: Use the minimum required length (the longest sequence in the content plus one).
  - `number`: Use this number or the minimum required, whichever is greater.
  - `"as-is"`: Allow the current length and do not report or fix.
- **`overrides`** (`Array<object>`):\
  Allows you to override `length` and `fallbackLength` for specific languages (info strings). Each item is an object with the following properties:
  - **`lang`** (`string`):\
    The info string (language) to match for the code block (e.g., `"js"`, `"md"`, `"sh"`). If the code block's info string matches this value, this override is applied instead of the global setting.
  - **`length`** (`number`):\
    The preferred code fence length for this language (must be 3 or greater).
  - **`fallbackLength`** (`number` | `"minimum"` | `"as-is"`, optional):\
    Fallback behavior for this language. If omitted, the global `fallbackLength` is used.

## 📚 Further Reading

- [CommonMark Spec: Fenced code blocks](https://spec.commonmark.org/0.31.2/#fenced-code-blocks)

## 👫 Related Rules

- [markdown-preferences/code-fence-style](./code-fence-style.md)
- [markdown-preferences/prefer-fenced-code-blocks](./prefer-fenced-code-blocks.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.20.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/code-fence-length.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/code-fence-length.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/code-fence-length)
