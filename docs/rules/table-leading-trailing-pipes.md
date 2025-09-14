---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/table-leading-trailing-pipes"
description: "enforce consistent use of leading and trailing pipes in tables."
---

# markdown-preferences/table-leading-trailing-pipes

> enforce consistent use of leading and trailing pipes in tables.

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- ⚙️ This rule is included in `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces the presence or absence of leading and trailing pipe (`|`) characters in Markdown tables, according to your configuration.
It helps maintain a consistent table style throughout your Markdown documents.
You can require both leading and trailing pipes (default), disallow both, or configure each side individually.
The rule automatically detects and reports lines in tables that do not match the configured style, and can autofix them.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/table-leading-trailing-pipes: 'error' -->

<!-- ✓ GOOD -->

| User Name | Date Of Birth | Favorite Color |
| --------- | ------------- | -------------- |
| Alice     | 2000-01-01    | Blue           |
| Bob       | 1995-05-23    | Green          |

<!-- ✗ BAD -->

User Name | Date Of Birth | Favorite Color
--------- | ------------- | --------------
Alice     | 2000-01-01    | Blue
Bob       | 1995-05-23    | Green
```

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/table-leading-trailing-pipes": ["error", "always"]
}
```

There are two types of options: **string format** and **object format**.

- **String format**: Specify either `"always"` or `"never"`. The default is `"always"`.
  - `"always"`: Requires a pipe (`|`) at both the beginning and end of each table line.
  - `"never"`: Disallows a pipe (`|`) at both the beginning and end of each table line.
- **Object format**: Allows you to configure the presence of leading and trailing pipes individually.
  - `leading`: Specifies whether to include a pipe (`|`) at the beginning of each line (`"always"` or `"never"`).
  - `trailing`: Specifies whether to include a pipe (`|`) at the end of each line (`"always"` or `"never"`).

### Example of `"never"`

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/table-leading-trailing-pipes: ["error", "never"] -->

<!-- ✓ GOOD -->

User Name | Date Of Birth | Favorite Color
--------- | ------------- | --------------
Alice     | 2000-01-01    | Blue
Bob       | 1995-05-23    | Green

<!-- ✗ BAD -->

| User Name | Date Of Birth | Favorite Color |
| --------- | ------------- | -------------- |
| Alice     | 2000-01-01    | Blue           |
| Bob       | 1995-05-23    | Green          |
```

<!-- prettier-ignore-end -->

### Example of `{ "leading": "always", "trailing": "never" }`

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/table-leading-trailing-pipes: ["error", { "leading": "always", "trailing": "never" }] -->

<!-- ✓ GOOD -->

| User Name | Date Of Birth | Favorite Color
| --------- | ------------- | --------------
| Alice     | 2000-01-01    | Blue
| Bob       | 1995-05-23    | Green

<!-- ✗ BAD -->

| User Name | Date Of Birth | Favorite Color |
| --------- | ------------- | -------------- |
| Alice     | 2000-01-01    | Blue           |
| Bob       | 1995-05-23    | Green          |

User Name | Date Of Birth | Favorite Color
--------- | ------------- | --------------
Alice     | 2000-01-01    | Blue
Bob       | 1995-05-23    | Green
```

<!-- prettier-ignore-end -->

### Example of `{ "leading": "never", "trailing": "always" }`

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/table-leading-trailing-pipes: ["error", { "leading": "never", "trailing": "always" }] -->

<!-- ✓ GOOD -->

User Name | Date Of Birth | Favorite Color |
--------- | ------------- | -------------- |
Alice     | 2000-01-01    | Blue           |
Bob       | 1995-05-23    | Green          |

<!-- ✗ BAD -->

| User Name | Date Of Birth | Favorite Color |
| --------- | ------------- | -------------- |
| Alice     | 2000-01-01    | Blue           |
| Bob       | 1995-05-23    | Green          |

User Name | Date Of Birth | Favorite Color
--------- | ------------- | --------------
Alice     | 2000-01-01    | Blue
Bob       | 1995-05-23    | Green
```

<!-- prettier-ignore-end -->

## 📚 Further Reading

- [GitHub Flavored Markdown: Tables (extension)](https://github.github.com/gfm/#tables-extension-)
- [carwin/markdown-styleguide](https://github.com/carwin/markdown-styleguide/blob/master/README.md)

## 👫 Related Rules

- [markdown-preferences/table-pipe-alignment](./table-pipe-alignment.md)
- [markdown-preferences/table-header-casing](./table-header-casing.md)

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/table-leading-trailing-pipes.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/table-leading-trailing-pipes.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/table-leading-trailing-pipes)
