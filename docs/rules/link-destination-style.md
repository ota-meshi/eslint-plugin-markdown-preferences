---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/link-destination-style"
description: "enforce a consistent style for link destinations"
---

# markdown-preferences/link-destination-style

> enforce a consistent style for link destinations

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- ⚙️ This rule is included in `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces a consistent style for link destinations (the URL part of links, images, and link definitions) in Markdown.
You can specify the style of the destination as either bare (e.g. `/url`) or pointy-bracketed (e.g. `</url>`).
By default, bare style is enforced. If the destination contains characters that require escaping and `avoidEscape` is enabled (default), the rule will not force a change that would require escaping.

### Examples

#### With `"bare"` Option (Default)

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/link-destination-style: 'error' -->

<!-- ✓ GOOD -->
- [foo](/bare-url)
- [foo](/bare-url 'with title')
- ![foo](/bare-url)

[ref]: /bare-url

<!-- ✗ BAD -->
- [foo](</pointy-bracketed-url>)
- ![foo](</pointy-bracketed-url>)

[ref]: </pointy-bracketed-url>
```

<!-- prettier-ignore-end -->

#### With `"pointy-brackets"` Option

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/link-destination-style: ["error", { "style": "pointy-brackets" }] -->

<!-- ✓ GOOD -->
- [foo](</pointy-bracketed-url>)
- [foo](</pointy-bracketed-url> 'with title')
- ![foo](</pointy-bracketed-url>)

[ref]: </pointy-bracketed-url>

<!-- ✗ BAD -->
- [foo](/bare-url)
- ![foo](/bare-url)

[ref]: /bare-url
```

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/link-destination-style": [
    "error",
    {
      "style": "bare",
      "avoidEscape": true
    }
  ]
}
```

### `style`

Type: `"bare" | "pointy-brackets"`\
Default: `"bare"`

Specify the style of the link destination:

- `"bare"`: Enforce bare destinations (e.g. `/url`)
- `"pointy-brackets"`: Enforce pointy-bracketed destinations (e.g. `</url>`)

### `avoidEscape`

Type: `boolean`\
Default: `true`

If `true`, the rule will not enforce a style if it would require escaping whitespace, control characters, or unbalanced parentheses in the destination.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/link-destination-style: ["error", { "avoidEscape": true }] -->

<!-- ✓ GOOD -->
- [foo](/bare-url)
- [foo](</pointy-bracketed-url with space>)
- [foo](</pointy-bracketed-url(with)unbalanced)parentheses>)

<!-- ✗ BAD -->
- [foo](</pointy-bracketed-url>)
- [foo](</pointy-bracketed-url(with)(balanced)parentheses>)
```

<!-- prettier-ignore-end -->

## 📚 Further Reading

- [CommonMark Spec: Links](https://spec.commonmark.org/0.31.2/#links)
- [CommonMark Spec: Images](https://spec.commonmark.org/0.31.2/#images)
- [CommonMark Spec: Link reference definitions](https://spec.commonmark.org/0.31.2/#link-reference-definitions)

## 👫 Related Rules

- [markdown-preferences/link-title-style](./link-title-style.md)
- [markdown-preferences/link-bracket-newline](./link-bracket-newline.md)
- [markdown-preferences/link-bracket-spacing](./link-bracket-spacing.md)

## 🔍 Implementation

<!-- eslint-disable markdown-links/no-dead-urls -- Auto generated -->

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/link-destination-style.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/link-destination-style.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/link-destination-style)

<!-- eslint-enable markdown-links/no-dead-urls -- Auto generated -->
