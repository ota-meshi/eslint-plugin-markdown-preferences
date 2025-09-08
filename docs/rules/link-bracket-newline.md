---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/link-bracket-newline"
description: "enforce linebreaks after opening and before closing link brackets"
---

# markdown-preferences/link-bracket-newline

> enforce linebreaks after opening and before closing link brackets

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- ⚙️ This rule is included in `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces consistent linebreaks (newlines) immediately after the opening and/or before the closing brackets of links, images, link references, image references, and link definitions in Markdown documents. It helps maintain a uniform style for link and image syntax, improving readability and reducing accidental formatting inconsistencies.

### What Does This Rule Check?

- **Links**: Checks for linebreaks just after `[` and just before `]` in inline links, e.g., `[label](/url)`.
- **Images**: Checks for linebreaks just after `![` and just before `]` in images, e.g., `![label](/url)`.
- **Link References**: Checks for linebreaks in `[label][ref]` and `[label][]`.
- **Image References**: Checks for linebreaks in `![label][ref]` and `![label][]`.
- **Link Definitions**: Checks for linebreaks in `[label]: /url`.

### Why Is This Important?

Consistent bracket linebreaks:

- Make Markdown easier to read and maintain.
- Prevent accidental formatting issues, especially when editing or copying links/images.
- Align with team or project style preferences.

### How Does It Work?

- By default, the rule is set to `newline: "never"`, disallowing linebreaks just inside the brackets.
- You can set it to `newline: "always"` to require a linebreak after the opening and before the closing bracket.
- With `newline: "consistent"`, the rule enforces consistency within each bracketed label.
- The `multiline` option allows you to require linebreaks only for multi-line labels.

### When Should You Use This Rule?

- When you want all Markdown links and images to have a consistent bracket linebreak style.
- When enforcing a style guide for documentation or collaborative writing.

### Examples

#### With `never` Option (Default)

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/link-bracket-newline: 'error' -->

<!-- ✓ GOOD -->

[foo](/url)
![foo](/url)
[foo][ref]

[ref]: /url

<!-- ✗ BAD -->

[
  foo
](/url)
![
  foo
](/url)
[foo][
   ref
  ]

[
 ref
 ]: /url
```

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/link-bracket-newline": [
    "error",
    {
      "newline": "never", // or "always" or "consistent"
      "multiline": false
    }
  ]
}
```

- `newline`:
  - `"never"` (Default) - No linebreaks allowed just inside the brackets.
  - `"always"` - Linebreaks required just inside the brackets.
  - `"consistent"` - Enforces consistency within each label.
- `multiline`:
  - `false` (Default) - Always apply the rule.
  - `true` - Only require linebreaks for multi-line labels.

## 📚 Further Reading

- [CommonMark Spec: Links](https://spec.commonmark.org/0.31.2/#links)
- [CommonMark Spec: Images](https://spec.commonmark.org/0.31.2/#images)
- [CommonMark Spec: Link reference definitions](https://spec.commonmark.org/0.31.2/#link-reference-definitions)

## 👫 Related Rules

- [markdown-preferences/link-bracket-spacing](./link-bracket-spacing.md)

## 🔍 Implementation

<!-- eslint-disable markdown-links/no-dead-urls -- Auto generated -->

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/link-bracket-newline.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/link-bracket-newline.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/link-bracket-newline)

<!-- eslint-enable markdown-links/no-dead-urls -- Auto generated -->
