---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/padded-custom-containers"
description: "disallow or require padding inside custom containers"
since: "v0.29.0"
---

# markdown-preferences/padded-custom-containers

> disallow or require padding inside custom containers

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
::: info
content
:::

::: info
# Heading

- list
:::

<!-- ✗ BAD -->
::: info

content

:::

::: info

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
      "padding": "never",
      "overrides": [
        {
          "info": "/^code-group\\b/u",
          "padding": "always"
        }
      ]
    }
  ]
}
```

- `padding`: Specify whether blank lines (padding) are required or disallowed before and after the content inside custom containers.
  - `"never"` (default): Disallow blank lines before and after the content inside custom containers.
  - `"always"`: Require blank lines before and after the content inside custom containers.
- `overrides`: Specify different padding rules for specific custom container types. Each override object can contain:
  - `info`: A string or array of strings matching the container info text (supports regular expressions).
  - `padding`: The padding setting for containers matching the info pattern (`"always"` or `"never"`).

### Override Examples

You can specify different padding rules for different container types:

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

````md
<!-- eslint markdown-preferences/padded-custom-containers: ["error", { "padding": "never", "overrides": [{ "info": "/^code-group\\b/u", "padding": "always" }] }] -->

<!-- ✓ GOOD -->

::: info
This is an info box.
:::

::: code-group

```js [config.js]
export default {/* ... */}
```

```ts [config.ts]
const config: UserConfig = {
  // ...
}
export default config
```

:::

<!-- ✗ BAD -->

::: info

This is an info box.

:::

::: code-group
```js [config.js]
export default {/* ... */}
```

```ts [config.ts]
const config: UserConfig = {
  // ...
}
export default config
```
:::
````

<!-- prettier-ignore-end -->

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
      "markdown-preferences/padded-custom-containers": "error",
    },
  },
]);
```

## 📚 Further Reading

- [VitePress: Markdown Extensions > Custom Containers](https://vitepress.dev/guide/markdown#custom-containers)

## 👫 Related Rules

- [markdown-preferences/padding-line-between-blocks](./padding-line-between-blocks.md)
- [markdown-preferences/no-implicit-block-closing](./no-implicit-block-closing.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.29.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/padded-custom-containers.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/padded-custom-containers.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/padded-custom-containers)
