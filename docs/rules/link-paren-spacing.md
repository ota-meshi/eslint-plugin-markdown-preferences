---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/link-paren-spacing"
description: "enforce consistent spacing inside link parentheses"
---

# markdown-preferences/link-paren-spacing

> enforce consistent spacing inside link parentheses

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- ⚙️ This rule is included in `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces consistent spacing inside the parentheses of links and images in Markdown documents. It helps maintain a uniform style for link and image syntax, improving readability and reducing accidental formatting inconsistencies.

### What Does This Rule Check?

- **Links**: Ensures that there are either always spaces or never spaces just inside the parentheses of link destinations and link titles, according to your configuration.
  - Example: `[foo](/url)` vs `[foo]( /url )`
- **Images**: Applies the same rule to image link destinations and image titles (the text inside `![ ... ]`).

### Why Is This Important?

Consistent parentheses spacing:

- Makes Markdown easier to read and maintain.
- Prevents accidental formatting issues, especially when copying or editing links/images.
- Aligns with team or project style preferences.

### How Does It Work?

- By default, the rule is set to `space: "never"`, disallowing spaces just inside the parentheses.
- You can set it to `space: "always"` to require spaces inside the parentheses.

### When Should You Use This Rule?

- When you want all Markdown links and images to have a consistent parenthesis spacing style.
- When enforcing a style guide for documentation or collaborative writing.

### Examples

#### With `never` Option (Default)

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/link-paren-spacing: 'error' -->

<!-- ✓ GOOD -->

[foo](/url)
![foo](/url)

<!-- ✗ BAD -->

[foo]( /url )
![foo]( /url )
```

<!-- prettier-ignore-end -->

#### With `always` Option

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/link-paren-spacing: 'error' -->

<!-- ✓ GOOD -->

[foo]( /url )
![foo]( /url )

<!-- ✗ BAD -->

[foo](/url)
![foo](/url)
```

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/link-paren-spacing": [
    "error",
    {
      "space": "never",
      "imagesInLinks": false
    }
  ]
}
```

- `space`
  - `"never"` (Default) - No spaces allowed just inside the parentheses.
  - `"always"` - Spaces required just inside the parentheses.

## 📚 Further Reading

- [CommonMark Spec: Links](https://spec.commonmark.org/0.31.2/#links)
- [CommonMark Spec: Images](https://spec.commonmark.org/0.31.2/#images)
- [CommonMark Spec: Link reference definitions](https://spec.commonmark.org/0.31.2/#link-reference-definitions)

## 👫 Related Rules

- [markdown-preferences/link-bracket-spacing](./link-bracket-spacing.md)
- [markdown-preferences/no-multi-spaces](./no-multi-spaces.md)

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/link-paren-spacing.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/link-paren-spacing.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/link-paren-spacing)
