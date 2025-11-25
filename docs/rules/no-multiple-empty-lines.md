---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/no-multiple-empty-lines"
description: "disallow multiple empty lines in Markdown files."
since: "v0.10.0"
---

# markdown-preferences/no-multiple-empty-lines

> disallow multiple empty lines in Markdown files.

- ⚙️ This rule is included in `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fix-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule helps maintain clean and readable Markdown files by limiting consecutive empty lines, ensuring consistent spacing and a professional appearance. Empty lines within code blocks and frontmatter (YAML, TOML, JSON) are ignored, allowing flexible formatting where needed.

By enforcing this rule, teams can maintain a consistent style in collaborative projects, prevent unnecessary diffs in version control, and ensure documents are easy to navigate.

### Practical Scenarios

1. **Organized Documentation:**
   When creating long documents with multiple sections, consistent spacing ensures the structure is easy to follow. This rule eliminates excessive blank lines, making the document more professional and readable.

2. **Improved Collaboration:**
   In collaborative projects, maintaining consistent spacing helps team members quickly understand the document structure, reducing confusion and improving productivity.

3. **Streamlined Reviews:**
   Consistent formatting minimizes unnecessary diffs in version control, making code reviews and document updates more efficient.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/no-multiple-empty-lines: 'error' -->

<!-- ✓ GOOD -->

# Heading

Paragraph

Another paragraph

<!-- ✗ BAD (multiple empty lines) -->

# Heading



Paragraph
```

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
---
# ✓ GOOD (frontmatter is excluded)
title: Example


---

Paragraph
```

<!-- prettier-ignore-end -->

````md
<!-- eslint markdown-preferences/no-multiple-empty-lines: 'error' -->

<!-- ✓ GOOD (code block is excluded) -->

```
code block


Paragraph
```
````

## 🔧 Options

```json
{
  "markdown-preferences/no-multiple-empty-lines": [
    "error",
    {
      "max": 1,
      "maxEOF": 0,
      "maxBOF": 0
    }
  ]
}
```

- `max`: Maximum number of consecutive empty lines allowed between content blocks. Default is `1`.
- `maxEOF`: Maximum number of consecutive empty lines allowed at the end of the file. Default is `0`.
- `maxBOF`: Maximum number of consecutive empty lines allowed at the beginning of the file. Default is `0`.

## 👫 Related Rules

- [no-multiple-empty-lines]
- [@stylistic/no-multiple-empty-lines](https://eslint.style/rules/no-multiple-empty-lines)

[no-multiple-empty-lines]: https://eslint.org/docs/latest/rules/no-multiple-empty-lines

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.10.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/no-multiple-empty-lines.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/no-multiple-empty-lines.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/no-multiple-empty-lines)
