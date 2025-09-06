---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/code-fence-style"
description: "enforce a consistent code fence style (backtick or tilde) in Markdown fenced code blocks."
---

# markdown-preferences/code-fence-style

> enforce a consistent code fence style (backtick or tilde) in Markdown fenced code blocks.

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces a consistent style for code fences (fenced code blocks) in Markdown.\
Markdown allows both backtick (` ``` `) and tilde (`~~~`) code fences, but mixing them can reduce readability and maintainability.\
This rule detects code fences that do not match the specified style (default: backtick) and reports them. It can also automatically fix them if desired.

**Why enforce a consistent style?**

- Ensures a unified look and editing experience across the project
- Prevents rendering or parsing issues
- Makes collaboration and integration with other tools easier

**About autofix**

- The type of fence (backtick/tilde) can be unified automatically
- The length of the fence (3 or more characters) and the language specifier are not changed

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

````md
<!-- eslint markdown-preferences/code-fence-style: 'error' -->

<!-- ✓ GOOD (when "backtick" is specified) -->
```js
console.log("hello");
```

<!-- ✓ GOOD (when "tilde" is specified) -->
~~~js
console.log("hello");
~~~

<!-- ✓ Ignore (conflict with content if converted) -->
~~~js
```md
```
~~~
````

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/code-fence-style": [
    "error",
    {
      "style": "backtick" // "backtick" (default) or "tilde"
    }
  ]
}
```

- `"backtick"`: Only backtick (` ``` `) fences are allowed
- `"tilde"`: Only tilde (`~~~`) fences are allowed

## 📚 Further Reading

- [CommonMark Spec: Fenced code blocks](https://spec.commonmark.org/0.31.2/#fenced-code-blocks)

## 👫 Related Rules

- [markdown-preferences/prefer-fenced-code-blocks](./prefer-fenced-code-blocks.md)

## 🔍 Implementation

<!-- eslint-disable markdown-links/no-dead-urls -- Auto generated -->

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/code-fence-style.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/code-fence-style.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/code-fence-style)

<!-- eslint-enable markdown-links/no-dead-urls -- Auto generated -->
