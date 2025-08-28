---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/padding-line-between-blocks"
description: "require or disallow padding lines between blocks"
---

# markdown-preferences/padding-line-between-blocks

> require or disallow padding lines between blocks

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- ⚙️ This rule is included in `plugin.configs.recommended`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces consistent padding lines between Markdown block elements.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/padding-line-between-blocks: ["error", {"prev": "*", "next": "*", "blankLine": "always"}] -->

<!-- ✓ GOOD -->
# Heading

Paragraph content.

## Another Heading

Another paragraph.

- List item

> Blockquote

<!-- ✗ BAD -->
# Heading
Paragraph content.
## Another Heading
Another paragraph.
- List item
> Blockquote
```

<!-- prettier-ignore-end -->

## 🔧 Options

This rule accepts an array of objects that define spacing rules between different block types.

```json
{
  "markdown-preferences/padding-line-between-blocks": [
    "error",
    [
      {
        "prev": "*",
        "next": "*",
        "blankLine": "always"
      }
    ]
  ]
}
```

### Rule Configuration

Each rule object has the following properties:

- `prev`: The type of the previous block element
- `next`: The type of the next block element
- `blankLine`: Spacing requirement between blocks

#### Block Types

- `"blockquote"` - Blockquote elements
- `"code"` - Code blocks
- `"heading"` - Heading elements
- `"list"` - List elements
- `"paragraph"` - Paragraph elements
- `"thematic-break"` - Horizontal rules
- `"table"` - Table elements
- `"link-definition"` - Link definitions
- `"footnote-definition"` - Footnote definitions
- `"frontmatter"` - Frontmatter sections (e.g., YAML frontmatter)
- `"html"` - HTML elements
- `"*"` - Wildcard matching any block type

#### Spacing Values

- `"always"` - Require a blank line
- `"never"` - Disallow blank lines
- `"any"` - No spacing restrictions

### Special Cases for `never`

When using `"never"`, this rule will preserve blank lines in cases where removing them would change the semantic meaning of the Markdown content. For example, with setext headings, a paragraph followed immediately by `---` creates a setext heading, while a paragraph followed by a blank line and then `---` creates separate paragraph and thematic break elements.

This careful handling ensures that the rule maintains semantic correctness while still enforcing consistent spacing preferences.

<!-- prettier-ignore-start -->

````md
<!-- eslint markdown-preferences/padding-line-between-blocks: ["error", {"prev": "paragraph", "next": "thematic-break", "blankLine": "never"}] -->

<!-- ✓ GOOD - Setext-style heading -->

Here is some title.
---

<!-- ✓ GOOD - Paragraph and thematic break. A blank line is always required between them -->

Here is some text.

---
````

<!-- prettier-ignore-end -->

## 👫 Related Rules

- [markdown-preferences/no-multiple-empty-lines](./no-multiple-empty-lines.md)

## 🔍 Implementation

<!-- eslint-disable markdown-links/no-dead-urls -- Auto generated -->

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/padding-line-between-blocks.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/padding-line-between-blocks.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/padding-line-between-blocks)

<!-- eslint-enable markdown-links/no-dead-urls -- Auto generated -->
