---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/custom-container-marker-spacing"
description: "require or disallow spacing between opening custom container marker and info"
since: "v0.30.0"
---

# markdown-preferences/custom-container-marker-spacing

> require or disallow spacing between opening custom container marker and info

- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces consistent spacing between the opening custom container marker (`:::`) and the info string in custom containers.
You can require a space (`"always"`) or disallow it (`"never"`).
By default, spaces are required.

**Note:** Custom containers are non-standard Markdown syntax. To use this rule with these extended syntaxes, you need to configure the `"markdown-preferences/extended-syntax"` language option in your ESLint configuration.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/custom-container-marker-spacing: 'error' -->

<!-- ✓ GOOD -->

::: warning
This is a warning.
:::

<!-- ✗ BAD -->

:::warning
This is a warning.
:::
```

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/custom-container-marker-spacing": [
    "error",
    {
      "space": "always"
    }
  ]
}
```

- `space` (string, default: `"always"`)
  - `"always"` requires a space between the opening custom container marker and the info string.
  - `"never"` disallows spaces between the opening custom container marker and the info string.

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

- [markdown-preferences/code-fence-spacing](./code-fence-spacing.md)
- [markdown-preferences/padded-custom-containers](./padded-custom-containers.md)
- [markdown-preferences/no-implicit-block-closing](./no-implicit-block-closing.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.30.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/custom-container-marker-spacing.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/custom-container-marker-spacing.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/custom-container-marker-spacing)
