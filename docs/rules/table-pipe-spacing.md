---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/table-pipe-spacing"
description: "enforce consistent spacing around table pipes"
since: "v0.25.0"
---

# markdown-preferences/table-pipe-spacing

> enforce consistent spacing around table pipes

- ⚙️ This rule is included in `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces consistent spacing around the pipe (`|`) characters in Markdown tables.
It checks both table headers and table body rows to ensure that the spacing around each pipe matches your configuration.

By default, a single space is required before and after each pipe, making tables easier to read and edit:

- `| Cell | Cell |` ← Good (with spaces)
- `|Cell|Cell|` ← Bad (no spaces)

You can configure the rule to require or disallow spaces, or specify different rules for leading and trailing pipes. The `--fix` option can automatically correct spacing issues according to your configuration.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/table-pipe-spacing: 'error' -->

<!-- ✓ GOOD -->

| User Name | Date Of Birth | Favorite Color |
| --------- | ------------- | -------------- |
| Alice     | 2000-01-01    | Blue           |
| Bob       | 1995-05-23    | Green          |

<!-- ✗ BAD -->

|User Name|Date Of Birth|Favorite Color|
|---------|-------------|--------------|
|Alice    |2000-01-01   |Blue          |
|Bob      |1995-05-23   |Green         |

```

<!-- prettier-ignore-end -->

## 🔧 Options

You can also use a shorthand form to specify a single alignment for all columns:

```json
{
  "markdown-preferences/table-pipe-spacing": [
    "error",
    {
      "space": "always",
      "cellAlign": {
        "defaultDelimiter": "left",
        "leftAlignmentDelimiter": "left",
        "centerAlignmentDelimiter": "center",
        "rightAlignmentDelimiter": "right"
      }
    }
  ]
}
```

- `space`: Defines the spacing style around table pipes. Possible values are:
  - `"always"`: Requires a single space before and after each pipe. This is the default behavior.
  - `"never"`: Disallows any spaces before or after pipes. However, spaces between cell content and the trailing pipe in headers and bodies are allowed.
  - object: Allows specifying different spacing rules for leading and trailing pipes. Each property can be set to `"always"` or `"never"`.
    - `leading`: Spacing rule for between the leading pipe and the cell content.
    - `trailing`: Spacing rule for between the trailing pipe and the delimiter.
- `cellAlign`: Controls the alignment of table cell content. Some conflicting options may be ignored when `space` is set to `never`. Possible values are:
  - `"left"`: All columns will be left-aligned, regardless of the delimiter row.
  - `"center"`: All columns will be center-aligned, regardless of the delimiter row.
  - `"right"`: All columns will be right-aligned, regardless of the delimiter row.
  - object: Allows specifying the alignment for each delimiter type. Each property can be set to `"left"`, `"center"`, `"right"`, or `"ignore"`. If `"ignore"` is specified, alignment will not be enforced for that delimiter type.
    - `defaultDelimiter`: (optional) Alignment for columns whose delimiter row does not specify alignment (e.g., just `---`). Defaults to `"left"` if not specified.
    - `leftAlignmentDelimiter`: (optional) Alignment for columns whose delimiter row indicates left alignment (e.g., `:---`). Defaults to `"left"` if not specified.
    - `centerAlignmentDelimiter`: (optional) Alignment for columns whose delimiter row indicates center alignment (e.g., `:---:`). Defaults to `"center"` if not specified.
    - `rightAlignmentDelimiter`: (optional) Alignment for columns whose delimiter row indicates right alignment (e.g., `---:`). Defaults to `"right"` if not specified.

## 📚 Further Reading

- [GitHub Flavored Markdown: Tables (extension)](https://github.github.com/gfm/#tables-extension-)

## 👫 Related Rules

- [markdown-preferences/no-multi-spaces](./no-multi-spaces.md)
- [markdown-preferences/table-leading-trailing-pipes](./table-leading-trailing-pipes.md)
- [markdown-preferences/table-pipe-alignment](./table-pipe-alignment.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.25.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/table-pipe-spacing.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/table-pipe-spacing.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/table-pipe-spacing)
