---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/table-pipe-alignment"
description: "enforce consistent alignment of table pipes"
since: "v0.25.0"
---

# markdown-preferences/table-pipe-alignment

> enforce consistent alignment of table pipes

- ⚙️ This rule is included in `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces consistent alignment of pipes (`|`) in Markdown tables.
It ensures that the vertical bars separating table columns are aligned according to the specified style, improving readability and consistency.
Misaligned pipes, such as those with inconsistent spacing or jagged columns, will be reported as problems.
The rule can automatically fix many alignment issues using the `--fix` option.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/table-pipe-alignment: 'error' -->

<!-- ✓ GOOD -->

| User Name | Date Of Birth | Favorite Color |
| --------- | ------------- | -------------- |
| Alice     | 2000-01-01    | Blue           |
| Bob       | 1995-05-23    | Green          |

<!-- ✗ BAD -->

| User Name | Date Of Birth | Favorite Color |
| --- | --- | --- |
| Alice | 2000-01-01 | Blue |
| Bob | 1995-05-23 | Green |
```

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/table-pipe-alignment": [
    "error",
    {
      "column": "minimum"
    }
  ]
}
```

- `column`: Specifies the alignment style for table pipes. Possible values are:
  - `"minimum"` (default): Aligns pipes to the minimum necessary positions based on the content.
  - `"consistent"`: Ensures that all pipes in a column are aligned consistently, based on the first row's alignment. However, if there are cells longer than the first row, they will be adjusted accordingly.

## 📚 Further Reading

- [GitHub Flavored Markdown: Tables (extension)](https://github.github.com/gfm/#tables-extension-)

## 👫 Related Rules

- [markdown-preferences/no-multi-spaces](./no-multi-spaces.md)
- [markdown-preferences/table-leading-trailing-pipes](./table-leading-trailing-pipes.md)
- [markdown-preferences/table-pipe-spacing](./table-pipe-spacing.md)
- [markdown-preferences/table-header-casing](./table-header-casing.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.25.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/table-pipe-alignment.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/table-pipe-alignment.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/table-pipe-alignment)
