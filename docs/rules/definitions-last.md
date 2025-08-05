---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/definitions-last"
description: "require link definitions and footnote definitions to be placed at the end of the document"
---

# markdown-preferences/definitions-last

> require link definitions and footnote definitions to be placed at the end of the document

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule requires link definitions (`[label]: URL`) and footnote definitions (`[^label]: text`) to be placed at the end of the document, after all other content.

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/definitions-last: 'error' -->

<!-- ✗ BAD -->
# Document Title

[link]: https://example.com

This content comes after a link definition.

[^note]: This footnote definition is too early.

More content here with [link] and footnote[^note].

<!-- ✓ GOOD -->
# Document Title

This is some content with [link] references and footnotes[^note].

## Section

More content here.

[link]: https://example.com
[^note]: This is a footnote definition.
```

## 🔧 Options

This rule has no options.

## 📚 Further reading

- [CommonMark Spec: Link Reference Definitions](https://spec.commonmark.org/0.31.2/#link-reference-definitions)
- [GitHub Flavored Markdown: Link Reference Definitions](https://github.github.com/gfm/#link-reference-definitions)

## 👫 Related rules

- [markdown-preferences/prefer-link-reference-definitions](./prefer-link-reference-definitions.md) - enforce using link reference definitions

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/definitions-last.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/definitions-last.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/definitions-last)
