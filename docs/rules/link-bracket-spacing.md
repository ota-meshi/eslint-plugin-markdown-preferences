---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/link-bracket-spacing"
description: "enforce consistent spacing inside link brackets"
---

# markdown-preferences/link-bracket-spacing

> enforce consistent spacing inside link brackets

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- ⚙️ This rule is included in `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces consistent spacing inside the brackets of links and images in Markdown documents. It helps maintain a uniform style for link and image syntax, improving readability and reducing accidental formatting inconsistencies.

### What Does This Rule Check?

- **Links**: Ensures that there are either always spaces or never spaces just inside the square brackets of link labels, according to your configuration.
  - Example: `[foo](/url)` vs `[ foo ](/url)`
- **Images**: Applies the same rule to image labels (the text inside `![ ... ]`).
- **Link Reference Definitions**: Also checks the label part of link reference definitions, e.g., `[ref]: /url`.

### Why Is This Important?

Consistent bracket spacing:

- Makes Markdown easier to read and maintain.
- Prevents accidental formatting issues, especially when copying or editing links/images.
- Aligns with team or project style preferences.

### How Does It Work?

- By default, the rule is set to `space: "never"`, disallowing spaces just inside the brackets.
- You can set it to `space: "always"` to require spaces inside the brackets.
- The `imagesInLinks` option allows fine-tuning for images inside links.

### When Should You Use This Rule?

- When you want all Markdown links and images to have a consistent bracket spacing style.
- When enforcing a style guide for documentation or collaborative writing.

### Examples

#### With `never` Option (Default)

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/link-bracket-spacing: 'error' -->

<!-- ✓ GOOD -->

[foo](/url)
[foo][ref]
![foo](/url)

[ref]: /url

<!-- ✗ BAD -->

[ foo ](/url)
[ foo][ ref ]
![ foo ](/url)

[ ref ]: /url
```

<!-- prettier-ignore-end -->

#### With `always` Option

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/link-bracket-spacing: 'error' -->

<!-- ✓ GOOD -->

[ foo ](/url)
[ foo][ ref ]
![ foo ](/url)

[ ref ]: /url

<!-- ✗ BAD -->

[foo](/url)
[foo][ref]
![foo](/url)

[ref]: /url
```

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/link-bracket-spacing": [
    "error",
    {
      "space": "never",
      "imagesInLinks": false
    }
  ]
}
```

- `space`
  - `"never"` (Default) - No spaces allowed just inside the brackets.
  - `"always"` - Spaces required just inside the brackets.
- `imagesInLinks`:
  - If you specify `true` with the `space: "never"` option, spaces will be enforced inside image label brackets.
  - If you specify `false` with the `space: "always"` option, spaces will be disallowed inside image label brackets.

## 📚 Further Reading

- [CommonMark Spec: Links](https://spec.commonmark.org/0.31.2/#links)
- [CommonMark Spec: Images](https://spec.commonmark.org/0.31.2/#images)
- [CommonMark Spec: Link reference definitions](https://spec.commonmark.org/0.31.2/#link-reference-definitions)

## 👫 Related Rules

- [markdown-preferences/no-multi-spaces](./no-multi-spaces.md)

## 🔍 Implementation

<!-- eslint-disable markdown-links/no-dead-urls -- Auto generated -->

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/link-bracket-spacing.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/link-bracket-spacing.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/link-bracket-spacing)

<!-- eslint-enable markdown-links/no-dead-urls -- Auto generated -->
