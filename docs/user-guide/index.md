# User Guide

## 💿 Installation

```sh
npm install --save-dev eslint @eslint/markdown eslint-plugin-markdown-preferences
```

## 📖 Usage

<!--USAGE_GUIDE_START-->

### Configuration

#### New Config (`eslint.config.js`)

Use `eslint.config.js` file to configure rules. See also: <https://eslint.org/docs/latest/use/configure/configuration-files-new>.

Example **eslint.config.js**:

```js
import { defineConfig } from "eslint/config";
// import markdown from "@eslint/markdown";
import markdownPreferences from "eslint-plugin-markdown-preferences";
export default defineConfig([
  // add more generic rule sets here, such as:
  // markdown.configs.recommended,
  markdownPreferences.configs.recommended,
  {
    files: ["**/*.md", "*.md"],
    rules: {
      // override/add rules settings here, such as:
      // 'markdown-preferences/prefer-linked-words': 'error'
    },
  },
]);
```

This plugin provides configs:

- `*.configs.recommended` ... Recommended config provided by the plugin.
- `*.configs.standard` ... Enforces opinionated stylistic conventions. You can extend this to enforce any stylistic conventions you like.

See [the rule list](../rules/index.md) to get the `rules` that this plugin provides.

##### Using Extended Syntax

This plugin experimentally supports some extended Markdown syntax.\
To use these extended syntaxes, set the `markdown-preferences/extended-syntax` language option.

```js
import { defineConfig } from "eslint/config";
import markdownPreferences from "eslint-plugin-markdown-preferences";
export default defineConfig([
  {
    extends: [markdownPreferences.configs.recommended],
    language: "markdown-preferences/extended-syntax",
  },
]);
```

The following syntaxes are supported:

- [Custom Containers](https://vitepress.dev/guide/markdown#custom-containers)\
  Example:

  ```md
  ::: warning
  This is a warning box.
  :::
  ```

- [Mathematical Expressions](https://docs.github.com/get-started/writing-on-github/working-with-advanced-formatting/writing-mathematical-expressions)\
  Example:

  ```md
  $
  E = mc^2
  $
  ```

#### Legacy Config (`.eslintrc`)

Is not supported.

<!--USAGE_GUIDE_END-->

## ❓ FAQ

- TODO
