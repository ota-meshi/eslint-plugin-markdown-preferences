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

- 📝 **Comprehensive style enforcement**\
  Unifies document expression and description style: heading casing, table header casing, inline code/link usage, emoji notation, and more.
- 🧩 **Notation and formatting consistency**\
  Standardizes Markdown notation: list markers, code fences, link/reference style, thematic breaks, and table formatting.
- 🎨 **Whitespace and decorative rules**\
  Controls indentation, spacing, line breaks, trailing spaces, and decorative elements for clean, readable Markdown.
- 🔧 **Auto-fix support**\
  Most rules support ESLint's `--fix` option for effortless formatting and correction.
- ⚙️ **Flexible configuration**\
  Provides both "recommended" and "standard" configs, and allows you to finely customize formatting and rules to suit your preferences and Markdown style.
- 🌐 **Live demo & documentation**\
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
[npmtrends]: http://www.npmtrends.com/eslint-plugin-markdown-preferences
