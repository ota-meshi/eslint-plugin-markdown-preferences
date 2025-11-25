---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/no-tabs"
description: "Disallow tab characters in Markdown files."
---

# markdown-preferences/no-tabs

> Disallow tab characters in Markdown files.

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- ⚙️ This rule is included in `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule disallows the use of tab characters in Markdown files.

Tabs can cause inconsistent rendering across different Markdown viewers and editors because tab width is not standardized. Using spaces instead of tabs ensures consistent appearance and alignment in Markdown files.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/no-tabs: 'error' -->

<!-- ✓ GOOD -->

- List item with spaces
    - Nested item with spaces

<!-- ✗ BAD -->

- List item with tab
	- Nested item with tab
```

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/no-tabs": [
    "error",
    {
      "checkTarget": "all",
      "ignoreCodeBlocks": [],
      "codeBlockTabWidth": 4
    }
  ]
}
```

- `checkTarget` (optional): Specifies which part of the content to check for tabs. Default is `"all"`.
  - `"all"`: Check all tabs (both indentation and non-indentation).
  - `"indentation"`: Check only tabs used for indentation (at the beginning of lines).
  - `"non-indentation"`: Check only tabs that are not used for indentation.
- `ignoreCodeBlocks` (optional): An array of language names to ignore tabs in code blocks. Default is `[]` (check all code blocks). Use `["*"]` to ignore all code blocks.
- `codeBlockTabWidth` (optional): The number of spaces to replace each tab with inside code blocks when auto-fixing. Default is `4`. Note that tabs outside of code blocks are always replaced with spaces based on a tab stop of 4, following the CommonMark specification.

### `checkTarget` (Default: `"all"`)

#### `"all"` (Default)

With the default setting, all tabs are reported.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/no-tabs: ['error', { "checkTarget": "all" }] -->

<!-- ✗ BAD: Tab at indentation -->

	Indented text

<!-- ✗ BAD: Tab in middle of line -->

Text	with	tabs
```

<!-- prettier-ignore-end -->

#### `"indentation"`

When set to `"indentation"`, only tabs at the beginning of lines (used for indentation) are reported.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/no-tabs: ['error', { "checkTarget": "indentation" }] -->

<!-- ✗ BAD: Tab at indentation -->

	Indented text

<!-- ✓ GOOD: Tab in middle of line (ignored) -->

Text	with	tabs
```

<!-- prettier-ignore-end -->

#### `"non-indentation"`

When set to `"non-indentation"`, only tabs that are not at the beginning of lines are reported.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/no-tabs: ['error', { "checkTarget": "non-indentation" }] -->

<!-- ✓ GOOD: Tab at indentation (ignored) -->

	Indented text

<!-- ✗ BAD: Tab in middle of line -->

Text	with	tabs
```

<!-- prettier-ignore-end -->

### `ignoreCodeBlocks` (Default: `[]`)

By default, tabs in code blocks are also checked. You can specify an array of language names to ignore tabs in those code blocks.

#### `["*"]`

When set to `["*"]`, all tabs in code blocks are ignored.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

````md
<!-- eslint markdown-preferences/no-tabs: ['error', { "ignoreCodeBlocks": ["*"] }] -->

<!-- ✓ GOOD: Tabs in code blocks are ignored -->

```js
function test() {
	return true;
}
```

```python
def test():
	return True
```
````

<!-- prettier-ignore-end -->

#### `["language1", "language2", ...]`

When set to an array of language names, tabs are only ignored in code blocks with the specified languages.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

````md
<!-- eslint markdown-preferences/no-tabs: ['error', { "ignoreCodeBlocks": ["go", "makefile"] }] -->

<!-- ✓ GOOD: Tabs in Go code blocks are ignored -->

```go
func test() {
	return true
}
```

<!-- ✓ GOOD: Tabs in Makefile code blocks are ignored -->

```makefile
target:
	echo "Hello"
```

<!-- ✗ BAD: Tabs in JavaScript code blocks are still checked -->

```js
function test() {
	return true;
}
```
````

<!-- prettier-ignore-end -->

### `codeBlockTabWidth` (Default: `4`)

Specifies the number of spaces to use when replacing tabs inside code blocks during auto-fix. This option only affects code blocks; tabs outside of code blocks are always replaced based on a tab stop of 4 spaces, as required by the CommonMark specification.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

````md
<!-- eslint markdown-preferences/no-tabs: ['error', { "codeBlockTabWidth": 2 }] -->

<!-- Auto-fix will replace tabs with 2 spaces in code blocks -->

```js
function test() {
  return true;
}
```
````

<!-- prettier-ignore-end -->

## 💡 When to Use This Rule

Use this rule when you want to:

- Ensure consistent indentation using spaces instead of tabs
- Maintain consistent rendering across different Markdown viewers
- Follow style guides that prohibit tabs in Markdown files

Some languages like Go and Makefile conventionally use tabs for indentation. In such cases, you can use the `ignoreCodeBlocks` option to allow tabs in those specific code blocks.

## 👫 Related Rules

- [markdown-preferences/indent](./indent.md)
- [markdown-preferences/no-trailing-spaces](./no-trailing-spaces.md)

## 🔍 Implementation

<!-- eslint-disable markdown-links/no-dead-urls -- Auto generated -->

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/no-tabs.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/no-tabs.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/no-tabs)

<!-- eslint-enable markdown-links/no-dead-urls -- Auto generated -->
