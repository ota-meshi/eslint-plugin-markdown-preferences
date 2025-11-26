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

<!--DOCS_IGNORE_START-->

## 📖 Documentation

For detailed usage instructions, rule configurations, and examples, visit our comprehensive [documentation site].

## 💿 Installation

```sh
npm install --save-dev eslint @eslint/markdown eslint-plugin-markdown-preferences
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

See [the rule list](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/) to get the `rules` that this plugin provides.

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
  $$
  E = mc^2
  $$
  ```

- [VitePress-style Import Code Snippets](https://vitepress.dev/guide/markdown#import-code-snippets) syntax using triple left angle brackets\
  Example:

  ```md
  <<< @/filepath
  ```

#### Legacy Config (`.eslintrc`)

Is not supported.

<!--USAGE_GUIDE_END-->

<!--USAGE_SECTION_END-->

## ✅ Rules

<!--RULES_SECTION_START-->

The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) automatically fixes problems reported by rules which have a wrench 🔧 below.\
The rules with the following ⭐ are included in the `recommended` config.\
The rules with the following 💄 are included in the `standard` config.

<!--RULES_TABLE_START-->

### Preference Rules

- Rules to unify the expression and description style of documents.

<!-- prettier-ignore-start -->

| Rule ID                                                                                                                                                           | Description                                                | Fixable | Config |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------- | :-----: | :----: |
| [markdown-preferences/canonical-code-block-language](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/canonical-code-block-language.html)     | enforce canonical language names in code blocks            |   🔧    |        |
| [markdown-preferences/emoji-notation](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/emoji-notation.html)                                   | enforce consistent emoji notation style in Markdown files. |   🔧    |        |
| [markdown-preferences/heading-casing](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/heading-casing.html)                                   | enforce consistent casing in headings.                     |   🔧    |        |
| [markdown-preferences/no-heading-trailing-punctuation](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/no-heading-trailing-punctuation.html) | disallow trailing punctuation in headings.                 |         |        |
| [markdown-preferences/ordered-list-marker-start](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/ordered-list-marker-start.html)             | enforce that ordered list markers start with 1 or 0        |   🔧    |   💄   |
| [markdown-preferences/prefer-inline-code-words](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-inline-code-words.html)               | enforce the use of inline code for specific words.         |   🔧    |        |
| [markdown-preferences/prefer-linked-words](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-linked-words.html)                         | enforce the specified word to be a link.                   |   🔧    |        |
| [markdown-preferences/table-header-casing](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/table-header-casing.html)                         | enforce consistent casing in table header cells.           |   🔧    |        |

<!-- prettier-ignore-end -->

### Notation Rules

- Rules related to notation styles in Markdown.

<!-- prettier-ignore-start -->

| Rule ID                                                                                                                                                               | Description                                                                                | Fixable | Config |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- | :-----: | :----: |
| [markdown-preferences/bullet-list-marker-style](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/bullet-list-marker-style.html)                   | enforce consistent bullet list (unordered list) marker style                               |   🔧    |   💄   |
| [markdown-preferences/code-fence-style](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/code-fence-style.html)                                   | enforce a consistent code fence style (backtick or tilde) in Markdown fenced code blocks.  |   🔧    |   💄   |
| [markdown-preferences/definitions-last](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/definitions-last.html)                                   | require link definitions and footnote definitions to be placed at the end of the document  |   🔧    |        |
| [markdown-preferences/emphasis-delimiters-style](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/emphasis-delimiters-style.html)                 | enforce a consistent delimiter style for emphasis and strong emphasis                      |   🔧    |   💄   |
| [markdown-preferences/hard-linebreak-style](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/hard-linebreak-style.html)                           | enforce consistent hard linebreak style.                                                   |   🔧    |  ⭐💄  |
| [markdown-preferences/level1-heading-style](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/level1-heading-style.html)                           | enforce consistent style for level 1 headings                                              |   🔧    |   💄   |
| [markdown-preferences/level2-heading-style](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/level2-heading-style.html)                           | enforce consistent style for level 2 headings                                              |   🔧    |   💄   |
| [markdown-preferences/link-destination-style](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/link-destination-style.html)                       | enforce a consistent style for link destinations                                           |   🔧    |   💄   |
| [markdown-preferences/link-title-style](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/link-title-style.html)                                   | enforce a consistent style for link titles                                                 |   🔧    |   💄   |
| [markdown-preferences/no-implicit-block-closing](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/no-implicit-block-closing.html)                 | disallow implicit block closing for fenced code blocks, math blocks, and custom containers |   🔧    |  ⭐💄  |
| [markdown-preferences/no-text-backslash-linebreak](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/no-text-backslash-linebreak.html)             | disallow text backslash at the end of a line.                                              |         |  ⭐💄  |
| [markdown-preferences/ordered-list-marker-style](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/ordered-list-marker-style.html)                 | enforce consistent ordered list marker style                                               |   🔧    |   💄   |
| [markdown-preferences/prefer-autolinks](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-autolinks.html)                                   | enforce the use of autolinks for URLs                                                      |   🔧    |  ⭐💄  |
| [markdown-preferences/prefer-fenced-code-blocks](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-fenced-code-blocks.html)                 | enforce the use of fenced code blocks over indented code blocks                            |   🔧    |  ⭐💄  |
| [markdown-preferences/prefer-link-reference-definitions](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-link-reference-definitions.html) | enforce using link reference definitions instead of inline links                           |   🔧    |        |
| [markdown-preferences/strikethrough-delimiters-style](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/strikethrough-delimiters-style.html)       | enforce a consistent delimiter style for strikethrough                                     |   🔧    |   💄   |
| [markdown-preferences/thematic-break-character-style](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/thematic-break-character-style.html)       | enforce consistent character style for thematic breaks (horizontal rules) in Markdown.     |   🔧    |   💄   |

<!-- prettier-ignore-end -->

### Whitespace Rules

- Rules related to whitespace styles in Markdown.

<!-- prettier-ignore-start -->

| Rule ID                                                                                                                                                           | Description                                                                    | Fixable | Config |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------- | :-----: | :----: |
| [markdown-preferences/blockquote-marker-alignment](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/blockquote-marker-alignment.html)         | enforce consistent alignment of blockquote markers                             |   🔧    |  ⭐💄  |
| [markdown-preferences/code-fence-spacing](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/code-fence-spacing.html)                           | require or disallow spacing between opening code fence and language identifier |   🔧    |   💄   |
| [markdown-preferences/custom-container-marker-spacing](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/custom-container-marker-spacing.html) | require or disallow spacing between opening custom container marker and info   |   🔧    |   💄   |
| [markdown-preferences/indent](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/indent.html)                                                   | enforce consistent indentation in Markdown files                               |   🔧    |   💄   |
| [markdown-preferences/link-bracket-newline](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/link-bracket-newline.html)                       | enforce linebreaks after opening and before closing link brackets              |   🔧    |   💄   |
| [markdown-preferences/link-bracket-spacing](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/link-bracket-spacing.html)                       | enforce consistent spacing inside link brackets                                |   🔧    |   💄   |
| [markdown-preferences/link-paren-newline](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/link-paren-newline.html)                           | enforce linebreaks after opening and before closing link parentheses           |   🔧    |   💄   |
| [markdown-preferences/link-paren-spacing](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/link-paren-spacing.html)                           | enforce consistent spacing inside link parentheses                             |   🔧    |   💄   |
| [markdown-preferences/list-marker-alignment](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/list-marker-alignment.html)                     | enforce consistent alignment of list markers                                   |   🔧    |  ⭐💄  |
| [markdown-preferences/no-multi-spaces](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/no-multi-spaces.html)                                 | disallow multiple spaces                                                       |   🔧    |   💄   |
| [markdown-preferences/no-multiple-empty-lines](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/no-multiple-empty-lines.html)                 | disallow multiple empty lines in Markdown files.                               |   🔧    |   💄   |
| [markdown-preferences/no-tabs](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/no-tabs.html)                                                 | disallow tab characters in Markdown files.                                     |   🔧    |   💄   |
| [markdown-preferences/no-trailing-spaces](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/no-trailing-spaces.html)                           | disallow trailing whitespace at the end of lines in Markdown files.            |   🔧    |   💄   |
| [markdown-preferences/padded-custom-containers](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/padded-custom-containers.html)               | disallow or require padding inside custom containers                           |   🔧    |   💄   |
| [markdown-preferences/padding-line-between-blocks](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/padding-line-between-blocks.html)         | require or disallow padding lines between blocks                               |   🔧    |   💄   |
| [markdown-preferences/table-pipe-spacing](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/table-pipe-spacing.html)                           | enforce consistent spacing around table pipes                                  |   🔧    |   💄   |

<!-- prettier-ignore-end -->

### Decorative Rules

- Rules related to visual or stylistic decorations in Markdown.

<!-- prettier-ignore-start -->

| Rule ID                                                                                                                                                                   | Description                                                                               | Fixable | Config |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------- | :-----: | :----: |
| [markdown-preferences/atx-heading-closing-sequence-length](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/atx-heading-closing-sequence-length.html) | enforce consistent length for the closing sequence (trailing #s) in ATX headings.         |   🔧    |   💄   |
| [markdown-preferences/atx-heading-closing-sequence](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/atx-heading-closing-sequence.html)               | enforce consistent use of closing sequence in ATX headings.                               |   🔧    |   💄   |
| [markdown-preferences/code-fence-length](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/code-fence-length.html)                                     | enforce consistent code fence length in fenced code blocks.                               |   🔧    |   💄   |
| [markdown-preferences/no-laziness-blockquotes](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/no-laziness-blockquotes.html)                         | disallow laziness in blockquotes                                                          |         |  ⭐💄  |
| [markdown-preferences/ordered-list-marker-sequence](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/ordered-list-marker-sequence.html)               | enforce that ordered list markers use sequential numbers                                  |   🔧    |   💄   |
| [markdown-preferences/setext-heading-underline-length](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/setext-heading-underline-length.html)         | enforce setext heading underline length                                                   |   🔧    |   💄   |
| [markdown-preferences/sort-definitions](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/sort-definitions.html)                                       | enforce a specific order for link definitions and footnote definitions                    |   🔧    |   💄   |
| [markdown-preferences/table-leading-trailing-pipes](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/table-leading-trailing-pipes.html)               | enforce consistent use of leading and trailing pipes in tables.                           |   🔧    |   💄   |
| [markdown-preferences/table-pipe-alignment](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/table-pipe-alignment.html)                               | enforce consistent alignment of table pipes                                               |   🔧    |   💄   |
| [markdown-preferences/thematic-break-length](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/thematic-break-length.html)                             | enforce consistent length for thematic breaks (horizontal rules) in Markdown.             |   🔧    |   💄   |
| [markdown-preferences/thematic-break-sequence-pattern](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/thematic-break-sequence-pattern.html)         | enforce consistent repeating patterns for thematic breaks (horizontal rules) in Markdown. |   🔧    |   💄   |

<!-- prettier-ignore-end -->

<!--RULES_TABLE_END-->

<!--RULES_SECTION_END-->

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

See the [LICENSE](./LICENSE) file for license rights and limitations (MIT).

[documentation site]: https://ota-meshi.github.io/eslint-plugin-markdown-preferences/
[npm-package]: https://www.npmjs.com/package/eslint-plugin-markdown-preferences
[npmtrends]: https://www.npmtrends.com/eslint-plugin-markdown-preferences
