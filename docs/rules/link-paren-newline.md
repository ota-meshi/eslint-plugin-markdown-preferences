---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/link-paren-newline"
description: "enforce linebreaks after opening and before closing link parentheses"
since: "v0.23.0"
---

# markdown-preferences/link-paren-newline

> enforce linebreaks after opening and before closing link parentheses

- ⚙️ This rule is included in `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fix-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces consistent linebreaks (newlines) immediately after the opening and/or before the closing parentheses of links, images, link references, image references, and link definitions in Markdown documents. It helps maintain a uniform style for link and image syntax, improving readability and reducing accidental formatting inconsistencies.

### What Does This Rule Check?

- **Links**: Checks for linebreaks just after `(` and just before `)` in inline links, e.g., `[label](/url)`.
- **Images**: Checks for linebreaks just after `(` and just before `)` in images, e.g., `![label](/url)`.

### Why Is This Important?

Consistent parentheses linebreaks:

- Make Markdown easier to read and maintain.
- Prevent accidental formatting issues, especially when editing or copying links/images.
- Align with team or project style preferences.

### How Does It Work?

- By default, the rule is set to `newline: "never"`, disallowing linebreaks just inside the parentheses.
- You can set it to `newline: "always"` to require a linebreak after the opening and before the closing parentheses.
- With `newline: "consistent"`, the rule enforces consistency within each parenthesized the destination and the title.
- The `multiline` option allows you to require linebreaks only for multi-line the destination and the title.

### When Should You Use This Rule?

- When you want all Markdown links and images to have a consistent parentheses linebreak style.
- When enforcing a style guide for documentation or collaborative writing.

### Examples

#### With `never` Option (Default)

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/link-paren-newline: 'error' -->

<!-- ✓ GOOD -->

[foo](/url)
![foo](/url)

<!-- ✗ BAD -->

[foo](
  /url
)
![foo](
  /url
)
```

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/link-paren-newline": [
    "error",
    {
      "newline": "never", // or "always" or "consistent"
      "multiline": false
    }
  ]
}
```

- `newline`:
  - `"never"` (Default) - No linebreaks allowed just inside the parentheses.
  - `"always"` - Linebreaks required just inside the parentheses.
  - `"consistent"` - Enforces consistency within each destination and title.
- `multiline`:
  - `false` (Default) - Always apply the rule.
  - `true` - Only require linebreaks for multi-line destinations and titles.

## 📚 Further Reading

- [CommonMark Spec: Links](https://spec.commonmark.org/0.31.2/#links)
- [CommonMark Spec: Images](https://spec.commonmark.org/0.31.2/#images)
- [CommonMark Spec: Link reference definitions](https://spec.commonmark.org/0.31.2/#link-reference-definitions)

## 👫 Related Rules

- [markdown-preferences/link-bracket-newline](./link-bracket-newline.md)
- [markdown-preferences/link-paren-spacing](./link-paren-spacing.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.23.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/link-paren-newline.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/link-paren-newline.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/link-paren-newline)
