# Introduction

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

- 📝 **Comprehensive style enforcement**
  Enforces consistent heading casing, table header casing, inline code/link usage, emoji notation, and more for unified document style.
- 🧩 **Powerful formatting consistency**
  Strongly standardizes Markdown formatting: whitespace, indentation, spacing, line breaks, list markers, code fences, links, references, thematic breaks, tables, and decorative elements—ensuring documents are clean and uniform.
- 🚀 **Extended Markdown syntax support**
  Supports custom containers, mathematical expressions, and other extended syntax for high compatibility with VitePress.
- 🔧 **Auto-fix support**
  Most rules support ESLint's `--fix` option for automatic correction.
- 🌐 **Online Demo & Documentation**
  Try it instantly in the [Online Demo](https://eslint-online-playground.netlify.app/#eslint-plugin-markdown-preferences) and see [full documentation][documentation site].

## 📖 Usage

See [User Guide](./user-guide/index.md).

## ✅ Rules

See [Available Rules](./rules/index.md).

## 👫 Related Packages

- [eslint-plugin-markdown-links](https://github.com/ota-meshi/eslint-plugin-markdown-links) ... ESLint plugin with powerful checking rules related to Markdown links.

<!--DOCS_IGNORE_START-->

## 🍻 Contributing

Welcome contributing!

Please use GitHub's Issues/PRs.

### Development Tools

- `npm test` runs tests and measures coverage.
- `npm run update` runs in order to update readme and recommended configuration.

## 🔒 License

See the [LICENSE](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/LICENSE) file for license rights and limitations (MIT).

[documentation site]: https://ota-meshi.github.io/eslint-plugin-markdown-preferences/
[npm-package]: https://www.npmjs.com/package/eslint-plugin-markdown-preferences
[npmtrends]: https://www.npmtrends.com/eslint-plugin-markdown-preferences
