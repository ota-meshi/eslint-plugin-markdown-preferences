---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/max-len"
description: "enforce maximum length for various Markdown entities"
---

# markdown-preferences/max-len

> enforce maximum length for various Markdown entities

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

## 📖 Rule Details

This rule enforces a configurable maximum length for different Markdown entities such as headings, paragraphs, lists, blockquotes, tables, code blocks, frontmatter, footnote definitions, HTML blocks, and math blocks.

Overly long Markdown elements reduce readability, make diffs harder to review, and complicate maintenance. By enforcing reasonable maximum lengths for various entities, documentation remains cleaner, easier to navigate, and more consistent across the project.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/max-len: ['error', { heading: 80, paragraph: 120 }] -->

<!-- ✓ GOOD -->

## This heading is within the limit

This is a paragraph that fits comfortably within the specified maximum length limit.

- A list item that is short enough

<!-- ✗ BAD -->

## This is a very long heading that exceeds the default eighty character maximum length

This is an extremely long paragraph that goes on and on and on well beyond the one hundred and twenty character maximum length limit and should be broken up.

- This is a very long list item that definitely exceeds the default one hundred and twenty character maximum length limit and should be reported
```

<!-- prettier-ignore-end -->

## 🔧 Options

This rule accepts an object with the following properties:

```json
{
  "markdown-preferences/max-len": [
    "error",
    {
      "heading": 80,
      "paragraph": 120,
      "list": 120,
      "blockquote": 120,
      "table": 120,
      "footnoteDefinition": 120,
      "html": 120,
      "code": "ignore",
      "frontmatter": "ignore",
      "math": "ignore",
      "ignoreUrls": true
    }
  ]
}
```

### Entity Options

These options control the maximum line length for specific Markdown entity types:

- `heading` (default: `80`): Maximum line length for headings. Set to `"ignore"` to skip checking.
- `paragraph` (default: `120`): Maximum line length for paragraphs. Set to `"ignore"` to skip checking.
- `table` (default: `120`): Maximum line length for tables. Set to `"ignore"` to skip checking.
- `html` (default: `120`): Maximum line length for HTML blocks. Set to `"ignore"` to skip checking.
- `code` (default: `"ignore"`): Maximum line length for code blocks. Set to `"ignore"` to skip checking (recommended). See [notes on code blocks](#notes-on-code-blocks) below.
- `frontmatter` (default: `"ignore"`): Maximum line length for frontmatter. Set to `"ignore"` to skip checking (recommended).
- `math` (default: `"ignore"`): Maximum line length for math blocks. Set to `"ignore"` to skip checking.

### Container Options

These options control line length checking for entities within container elements. Containers can either have a simple numeric limit (applied to all nested content) or an object specifying different limits for different entity types within that container:

- `list`: Override limits for content within lists. When not specified, nested content inherits from entity-level defaults.
- `blockquote`: Override limits for content within blockquotes. When not specified, nested content inherits from entity-level defaults.
- `footnoteDefinition`: Override limits for content within footnote definitions. When not specified, nested content inherits from entity-level defaults.

#### Nested Configuration for Containers

For `list`, `blockquote`, and `footnoteDefinition`, you can specify different limits for any entity types within these containers (including `heading`, `paragraph`, `table`, `html`, `math`, `code`, and `frontmatter`):

```json
{
  "markdown-preferences/max-len": [
    "error",
    {
      "heading": 80,
      "paragraph": 120,
      "table": 100,
      "blockquote": {
        "heading": 70,
        "paragraph": 100,
        "table": 90
      }
    }
  ]
}
```

In this example:
- Standalone headings are limited to 80 characters, but headings inside blockquotes are limited to 70 characters
- Standalone tables are limited to 100 characters, but tables inside blockquotes are limited to 90 characters
- All entity types (`heading`, `paragraph`, `table`, `html`, `math`, `code`, `frontmatter`) can be configured within containers

### Language-specific Code Block Configuration

For `code` and `frontmatter`, you can specify different limits per language:

```json
{
  "markdown-preferences/max-len": [
    "error",
    {
      "code": {
        "javascript": 100,
        "python": 80,
        "shell": "ignore"
      },
      "frontmatter": {
        "yaml": 120,
        "toml": "ignore"
      }
    }
  ]
}
```

### URL Handling

- `ignoreUrls` (default: `true`): When enabled, lines containing URLs are ignored.

This option works similarly to [`@stylistic/eslint-plugin`'s `max-len` rule](https://eslint.style/rules/max-len#ignoreurls).

### Notes on Code Blocks

**Note:** Code blocks are ignored by default (`code: "ignore"`) because:

1. Code inside code blocks should be linted using language-specific linters via ESLint's language plugins
2. The [`@eslint/markdown`](https://github.com/eslint/markdown) plugin supports linting code blocks as their respective languages
3. This rule cannot understand the syntax inside code blocks (e.g., comments, strings)

If you need to enforce line length for code blocks in Markdown, you can:

- Use the language-specific ESLint configuration for code blocks (recommended):

  ```js
  {
    files: ["**/*.md/*.js"],
    rules: {
      "@stylistic/max-len": ["error", { "ignoreComments": true }]
    }
  }
  ```

  **However**, this feature is not currently available with this plugin. It may be possible in the future. The RFC is at: <https://github.com/eslint/rfcs/pull/105>

- Set the `code` option to enforce a simple line length limit (not syntax-aware)

For more information, see the [advanced configuration guide](https://github.com/eslint/markdown/blob/main/docs/processors/markdown.md#advanced-configuration).

## 📚 Further Reading

- [Markdownlint MD013](https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md013.md) - Similar rule in markdownlint
- [@stylistic/eslint-plugin max-len](https://eslint.style/rules/max-len) - ESLint stylistic rule for code

## 👫 Related Rules

- [no-multiple-empty-lines](./no-multiple-empty-lines.md) - Disallow multiple empty lines

## 🔍 Implementation

<!-- eslint-disable markdown-links/no-dead-urls -- Auto generated -->

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/max-len.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/max-len.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/max-len)

<!-- eslint-enable markdown-links/no-dead-urls -- Auto generated -->
