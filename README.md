# eslint-plugin-markdown-preferences

A specialized ESLint plugin that helps enforce consistent writing style and formatting conventions in Markdown files. Perfect for documentation projects, blog posts, and any Markdown content where consistency matters.

[![NPM license](https://img.shields.io/npm/l/eslint-plugin-markdown-preferences.svg)][npm-package]
[![NPM version](https://img.shields.io/npm/v/eslint-plugin-markdown-preferences.svg)][npm-package]
[![NPM downloads](https://img.shields.io/badge/dynamic/json.svg?label=downloads&colorB=green&suffix=/day&query=$.downloads&uri=https://api.npmjs.org//downloads/point/last-day/eslint-plugin-markdown-preferences&maxAge=3600)][npmtrends]
[![NPM downloads](https://img.shields.io/npm/dw/eslint-plugin-markdown-preferences.svg)][npmtrends]
[![NPM downloads](https://img.shields.io/npm/dm/eslint-plugin-markdown-preferences.svg)][npmtrends]
[![NPM downloads](https://img.shields.io/npm/dy/eslint-plugin-markdown-preferences.svg)][npmtrends]
[![NPM downloads](https://img.shields.io/npm/dt/eslint-plugin-markdown-preferences.svg)][npmtrends]
[![Build Status](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/actions/workflows/NodeCI.yml/badge.svg?branch=main)](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/actions/workflows/NodeCI.yml)

## 📛 Features

- **⚡ Effortless automation** - Transform your Markdown with auto-fixing that handles formatting, linking, and style consistency automatically
- **📖 Professional documentation** - Enforce consistent line breaks, clean up trailing spaces, and organize link definitions for enterprise-ready documentation
- **🎯 Smart terminology management** - Automatically convert specified words into inline code or clickable links based on your configuration
- **⚙️ Highly customizable configuration** - Fine-tune every aspect with granular rule options, word lists, ignore patterns, and flexible thresholds to match your exact requirements

**Try it live:** Check out the [Online Demo](https://eslint-online-playground.netlify.app/#eslint-plugin-markdown-preferences) to see the plugin in action!

<!--DOCS_IGNORE_START-->

## 📖 Documentation

For detailed usage instructions, rule configurations, and examples, visit our comprehensive [documentation site](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/).

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

The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) automatically fixes problems reported by rules which have a wrench 🔧 below.\
The rules with the following star ⭐ are included in the configs.

<!--RULES_TABLE_START-->

### Preference Rules

| Rule ID | Description | Fixable | RECOMMENDED |
|:--------|:------------|:-------:|:-----------:|
| [markdown-preferences/no-text-backslash-linebreak](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/no-text-backslash-linebreak.html) | disallow text backslash at the end of a line. |  | ⭐ |
| [markdown-preferences/prefer-inline-code-words](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-inline-code-words.html) | enforce the use of inline code for specific words. | 🔧 |  |
| [markdown-preferences/prefer-linked-words](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-linked-words.html) | enforce the specified word to be a link. | 🔧 |  |

### Stylistic Rules

| Rule ID | Description | Fixable | RECOMMENDED |
|:--------|:------------|:-------:|:-----------:|
| [markdown-preferences/definitions-last](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/definitions-last.html) | require link definitions and footnote definitions to be placed at the end of the document | 🔧 |  |
| [markdown-preferences/hard-linebreak-style](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/hard-linebreak-style.html) | enforce consistent hard linebreak style. | 🔧 | ⭐ |
| [markdown-preferences/heading-casing](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/heading-casing.html) | enforce consistent casing in headings. | 🔧 |  |
| [markdown-preferences/no-trailing-spaces](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/no-trailing-spaces.html) | disallow trailing whitespace at the end of lines in Markdown files. | 🔧 |  |
| [markdown-preferences/prefer-link-reference-definitions](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-link-reference-definitions.html) | enforce using link reference definitions instead of inline links | 🔧 |  |
| [markdown-preferences/sort-definitions](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/sort-definitions.html) | enforce a specific order for link definitions and footnote definitions | 🔧 |  |

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

[npm-package]: https://www.npmjs.com/package/eslint-plugin-markdown-preferences
[npmtrends]: http://www.npmtrends.com/eslint-plugin-markdown-preferences
