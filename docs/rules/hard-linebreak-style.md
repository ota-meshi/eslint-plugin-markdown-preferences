---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/hard-linebreak-style"
description: "enforce consistent hard linebreak style."
since: "v0.1.0"
---

# markdown-preferences/hard-linebreak-style

> enforce consistent hard linebreak style.

- ⚙️ This rule is included in `plugin.configs.recommended`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces a consistent hard linebreak style in Markdown files. In Markdown, there are two ways to create hard line breaks:

1. **Backslash style** (`\`): A backslash at the end of a line
2. **Spaces style**: Two or more spaces at the end of a line

Both styles are valid in CommonMark, but using one consistently improves readability and maintainability.

### Examples

#### Default Configuration (`"backslash"`)

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/hard-linebreak-style: 'error' -->

<!-- ✓ GOOD -->
This line ends with a backslash\
and continues here.

Another example with\
multiple line breaks.

<!-- ✗ BAD -->
This line ends with spaces  
and continues here.

<!-- ✗ BAD -->
Mixed styles are not allowed\
this line uses spaces  
inconsistently.
```

#### With `"spaces"` Configuration

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/hard-linebreak-style: ['error', { style: 'spaces' }] -->

<!-- ✓ GOOD -->
This line ends with spaces  
and continues here.

Another example with  
multiple line breaks.

<!-- ✗ BAD -->
This line ends with backslash\
and continues here.
```

### When Not to Use

- If you don't need consistent hard linebreak styles in your project
- If you're working with existing content that deliberately uses mixed styles
- If you're using a different Markdown processor that has specific requirements

## 🔧 Options

```json
{
  "markdown-preferences/hard-linebreak-style": [
    "error",
    {
      "style": "backslash" // or "spaces"
    }
  ]
}
```

### `style` (string)

The style of hard linebreak to enforce.

**Available Options:**

- `"backslash"` (default): Enforces the use of backslashes (`\`) for hard linebreaks.
- `"spaces"`: Enforces the use of two or more spaces for hard linebreaks.

## 📚 Further reading

- [CommonMark Spec: Hard Line Breaks](https://spec.commonmark.org/0.31.2/#hard-line-breaks)
- [Markdown Guide: Line Breaks](https://www.markdownguide.org/basic-syntax/#line-breaks)
- [GitHub Flavored Markdown: Hard Line Breaks](https://github.github.com/gfm/#hard-line-breaks)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.1.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/hard-linebreak-style.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/hard-linebreak-style.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/hard-linebreak-style)
