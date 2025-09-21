---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/no-implicit-block-closing"
description: "disallow implicit block closing for fenced code blocks, math blocks, and custom blocks"
---

# markdown-preferences/no-implicit-block-closing

> disallow implicit block closing for fenced code blocks, math blocks, and custom blocks

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- ⚙️ This rule is included in `plugin.configs.recommended` and `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule disallows implicit block closing for fenced code blocks, math blocks, and custom blocks in Markdown.\
While Markdown allows blocks to be implicitly closed at the end of the document or when encountering certain other elements, explicit closing markers improve readability and prevent unintended content inclusion.

**Note:** Math blocks and custom blocks are non-standard Markdown syntax. To use this rule with these extended syntaxes, you need to configure the `"markdown-preferences/extended-syntax"` language option in your ESLint configuration.

**Why require explicit closing markers?**

- Improves code clarity and prevents ambiguity about where blocks end
- Prevents accidentally including unintended trailing content in blocks
- Makes it easier to understand the document structure
- Ensures consistent behavior across different Markdown parsers

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

````md
<!-- eslint markdown-preferences/no-implicit-block-closing: 'error' -->

<!-- ✓ GOOD -->

```js
console.log("hello");
```

> ```js
> console.log("hello");
> ```

<!-- ✗ BAD -->

> ```js
> console.log("hello");

```js
console.log("hello");
````

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/no-implicit-block-closing: 'error' -->

<!-- ✓ GOOD -->

::: warning
This is a warning block.
:::

<!-- ✗ BAD -->

::: warning
This is a warning block.
<!-- Missing closing marker -->
```

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/no-implicit-block-closing: 'error' -->

<!-- ✓ GOOD -->

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

<!-- ✗ BAD -->

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
<!-- Missing closing math block marker -->
```

<!-- prettier-ignore-end -->

## 🔧 Options

This rule has no options.

### Configuration for Extended Syntax

To check math blocks and custom blocks (which are non-standard Markdown syntax), you need to configure the `"markdown-preferences/extended-syntax"` language option:

```js
// eslint.config.js
import { defineConfig } from "eslint/config";
import markdownPreferences from "eslint-plugin-markdown-preferences";

export default defineConfig([
  {
    extends: [markdownPreferences.configs.recommended],
    language: "markdown-preferences/extended-syntax",
    rules: {
      "markdown-preferences/no-implicit-block-closing": "error",
    },
  },
]);
```

## 📚 Further Reading

- [CommonMark Spec: Fenced code blocks](https://spec.commonmark.org/0.31.2/#fenced-code-blocks)
- [VitePress: Markdown Extensions > Custom Containers](https://vitepress.dev/guide/markdown#custom-containers)
- [GitHub Docs: Writing mathematical expressions](https://docs.github.com/get-started/writing-on-github/working-with-advanced-formatting/writing-mathematical-expressions)

## 👫 Related Rules

- [markdown-preferences/code-fence-style](./code-fence-style.md)
- [markdown-preferences/code-fence-length](./code-fence-length.md)

## � Version

This rule was introduced in eslint-plugin-markdown-preferences v0.22.0

## 🔍 Implementation

<!-- eslint-disable markdown-links/no-dead-urls -- Auto generated -->

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/no-implicit-block-closing.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/no-implicit-block-closing.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/no-implicit-block-closing)

<!-- eslint-enable markdown-links/no-dead-urls -- Auto generated -->
