---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/table-pipe-spacing"
description: "enforce consistent spacing around table pipes"
---

# markdown-preferences/table-pipe-spacing

> enforce consistent spacing around table pipes

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
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

```json
{
  "markdown-preferences/table-pipe-spacing": [
    "error",
    {
      "space": "always",
      "alignToDelimiterAlignment": true
    }
  ]
}
```

- `space`: Defines the spacing style around table pipes. Possible values are:
  - `"always"`: Requires a single space before and after each pipe. This is the default behavior.
  - `"never"`: Disallows any spaces before or after pipes. However, spaces between cell content and the trailing pipe in headers and bodies are allowed.
  - object: Allows specifying different spacing rules for leading and trailing pipes.
    Each property can be set to `"always"` or `"never"`.
    - `leading`: Spacing rule for between the leading pipe and the cell content.
    - `trailing`: Spacing rule for between the trailing pipe and the delimiter.
- `alignToDelimiterAlignment`: Aligns spaces based on the alignment of the delimiter row. If set to `true`, the rule will ensure that spaces around pipes are consistent with the alignment specified in the delimiter row (e.g., left-aligned, right-aligned, center-aligned). This helps maintain a visually appealing table structure. This option is only applicable when `space` is set to `"always"`. The default value is `true`.

## 📚 Further Reading

- [GitHub Flavored Markdown: Tables (extension)](https://github.github.com/gfm/#tables-extension-)

## 👫 Related Rules

- [markdown-preferences/no-multi-spaces](./no-multi-spaces.md)
- [markdown-preferences/table-leading-trailing-pipes](./table-leading-trailing-pipes.md)
- [markdown-preferences/table-pipe-alignment](./table-pipe-alignment.md)

## 🔍 Implementation

<!-- eslint-disable markdown-links/no-dead-urls -- Auto generated -->

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/table-pipe-spacing.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/table-pipe-spacing.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/table-pipe-spacing)

<!-- eslint-enable markdown-links/no-dead-urls -- Auto generated -->
