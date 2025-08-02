# Introduction

[eslint-plugin-markdown-preferences](https://www.npmjs.com/package/eslint-plugin-markdown-preferences) is ESLint plugin that enforces our markdown preferences.

[![NPM license](https://img.shields.io/npm/l/eslint-plugin-markdown-preferences.svg)](https://www.npmjs.com/package/eslint-plugin-markdown-preferences)
[![NPM version](https://img.shields.io/npm/v/eslint-plugin-markdown-preferences.svg)](https://www.npmjs.com/package/eslint-plugin-markdown-preferences)
[![NPM downloads](https://img.shields.io/badge/dynamic/json.svg?label=downloads&colorB=green&suffix=/day&query=$.downloads&uri=https://api.npmjs.org//downloads/point/last-day/eslint-plugin-markdown-preferences&maxAge=3600)](http://www.npmtrends.com/eslint-plugin-markdown-preferences)
[![NPM downloads](https://img.shields.io/npm/dw/eslint-plugin-markdown-preferences.svg)](http://www.npmtrends.com/eslint-plugin-markdown-preferences)
[![NPM downloads](https://img.shields.io/npm/dm/eslint-plugin-markdown-preferences.svg)](http://www.npmtrends.com/eslint-plugin-markdown-preferences)
[![NPM downloads](https://img.shields.io/npm/dy/eslint-plugin-markdown-preferences.svg)](http://www.npmtrends.com/eslint-plugin-markdown-preferences)
[![NPM downloads](https://img.shields.io/npm/dt/eslint-plugin-markdown-preferences.svg)](http://www.npmtrends.com/eslint-plugin-markdown-preferences)
[![Build Status](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/actions/workflows/NodeCI.yml/badge.svg?branch=main)](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/actions/workflows/NodeCI.yml)

## 📛 Features

ESLint plugin that enforces our markdown preferences.

You can check on the [Online DEMO](https://eslint-online-playground.netlify.app/#eslint-plugin-markdown-preferences).

<!--DOCS_IGNORE_START-->

## 📖 Documentation

See [documents](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/).

## 💿 Installation

```bash
npm install --save-dev eslint eslint-plugin-markdown-preferences
```

<!--DOCS_IGNORE_END-->

## 📖 Usage

<!--USAGE_SECTION_START-->
<!--USAGE_GUIDE_START-->

### Configuration

#### New Config (`eslint.config.js`)

Use `eslint.config.js` file to configure rules. See also: <https://eslint.org/docs/latest/use/configure/configuration-files-new>.

Example **eslint.config.js**:

```js
import { defineConfig } from "eslint/config";
// import markdown from "@eslint/markdown";
import markdownPreferences from 'eslint-plugin-markdown-preferences';
export default [
  // add more generic rule sets here, such as:
  // markdown.configs.recommended,
  markdownPreferences.configs.recommended,
  {
    rules: {
      // override/add rules settings here, such as:
      // 'markdown-preferences/prefer-linked-words': 'error'
    }
  }
];
```

This plugin provides configs:

- `*.configs.recommended` ... Recommended config provided by the plugin.

See [the rule list](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/) to get the `rules` that this plugin provides.

#### Legacy Config (`.eslintrc`)

Is not supported.

<!--USAGE_GUIDE_END-->
<!--USAGE_SECTION_END-->

## ✅ Rules

<!--RULES_SECTION_START-->

The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) automatically fixes problems reported by rules which have a wrench 🔧 below.  
The rules with the following star ⭐ are included in the configs.

<!--RULES_TABLE_START-->

### Markdown Rules

| Rule ID | Description | Fixable | RECOMMENDED |
|:--------|:------------|:-------:|:-----------:|
| [markdown-preferences/hard-linebreak-style](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/hard-linebreak-style.html) | enforce consistent hard linebreak style. | 🔧 | ⭐ |
| [markdown-preferences/prefer-linked-words](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-linked-words.html) | enforce the specified word to be a link. | 🔧 |  |

<!--RULES_TABLE_END-->
<!--RULES_SECTION_END-->
<!--DOCS_IGNORE_START-->

## 🍻 Contributing

Welcome contributing!

Please use GitHub's Issues/PRs.

### Development Tools

- `npm test` runs tests and measures coverage.  
- `npm run update` runs in order to update readme and recommended configuration.  

## 🔒 License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).
