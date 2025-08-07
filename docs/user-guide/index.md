# User Guide

## 💿 Installation

```sh
npm install --save-dev eslint eslint-plugin-markdown-preferences
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
export default [
  // add more generic rule sets here, such as:
  // markdown.configs.recommended,
  markdownPreferences.configs.recommended,
  {
    rules: {
      // override/add rules settings here, such as:
      // 'markdown-preferences/prefer-linked-words': 'error'
    },
  },
];
```

This plugin provides configs:

- `*.configs.recommended` ... Recommended config provided by the plugin.

See [the rule list](../rules/index.md) to get the `rules` that this plugin provides.

#### Legacy Config (`.eslintrc`)

Is not supported.

<!--USAGE_GUIDE_END-->

## ❓ FAQ

- TODO
