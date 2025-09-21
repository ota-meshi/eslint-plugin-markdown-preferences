---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/padded-custom-containers"
description: "disallow or require padding inside custom containers"
---

# markdown-preferences/padded-custom-containers

> disallow or require padding inside custom containers

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- ⚙️ This rule is included in `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule checks whether there are blank lines (padding) immediately after the opening `:::` and before the next content, and immediately before the closing `:::` and after the previous content in custom containers.
By default, blank lines (padding) at these positions are not allowed (padding is disallowed).

**Note:** Custom containers are non-standard Markdown syntax. To use this rule with these extended syntaxes, you need to configure the `"markdown-preferences/extended-syntax"` language option in your ESLint configuration.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/padded-custom-containers: 'error' -->

<!-- ✓ GOOD -->
:::
content
:::

:::
# Heading

- list
:::

<!-- ✗ BAD -->
:::

content

:::

:::

# Heading

- list

:::
```

<!-- prettier-ignore-end -->

## 🔧 Options

By default, blank lines (padding) are disallowed (`{ padding: "never" }`).
You can require blank lines by setting `{ padding: "always" }`.

```json
{
  "markdown-preferences/padded-custom-containers": [
    "error",
    {
      "padding": "never"
    }
  ]
}
```

- `padding`: Specify whether blank lines (padding) are required or disallowed before and after the content inside custom containers.
  - `"never"` (default): Disallow blank lines before and after the content inside custom containers.
  - `"always"`: Require blank lines before and after the content inside custom containers.

### Configuration for Extended Syntax

To check custom containers (which are non-standard Markdown syntax), you need to configure the `"markdown-preferences/extended-syntax"` language option:

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

- [VitePress: Markdown Extensions > Custom Containers](https://vitepress.dev/guide/markdown#custom-containers)

## 👫 Related Rules

- [markdown-preferences/padding-line-between-blocks](./padding-line-between-blocks.md)
- [markdown-preferences/no-implicit-block-closing](./no-implicit-block-closing.md)

## 🔍 Implementation

<!-- eslint-disable markdown-links/no-dead-urls -- Auto generated -->

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/padded-custom-containers.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/padded-custom-containers.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/padded-custom-containers)

<!-- eslint-enable markdown-links/no-dead-urls -- Auto generated -->
