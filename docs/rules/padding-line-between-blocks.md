---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/padding-line-between-blocks"
description: "require or disallow padding lines between blocks"
since: "v0.16.0"
---

# markdown-preferences/padding-line-between-blocks

> require or disallow padding lines between blocks

- ⚙️ This rule is included in `plugin.configs.standard`.
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
    {
      "prev": "*",
      "next": "*",
      "blankLine": "always"
    },
    {
      "prev": "link-definition",
      "next": "link-definition",
      "blankLine": "never"
    },
    {
      "prev": "footnote-definition",
      "next": "footnote-definition",
      "blankLine": "never"
    },
    {
      "prev": "paragraph",
      "next": { "type": "list", "in": "list" },
      "blankLine": "never"
    }
  ]
}
```

### Rule Configuration

Each rule object has the following properties:

- `prev`: The type of the previous block element (string or object)
- `next`: The type of the next block element (string or object)
- `blankLine`: Spacing requirement between blocks

If multiple configurations match a block pair, the configuration that appears last in the array takes precedence.

Default configuration:

```json
{
  "markdown-preferences/padding-line-between-blocks": [
    "error",
    { "prev": "*", "next": "*", "blankLine": "always" },
    {
      "prev": "link-definition",
      "next": "link-definition",
      "blankLine": "never"
    },
    {
      "prev": "footnote-definition",
      "next": "footnote-definition",
      "blankLine": "never"
    },
    {
      "prev": "paragraph",
      "next": { "type": "list", "in": "list" },
      "blankLine": "never"
    }
  ]
}
```

This configuration is designed with Prettier compatibility in mind, but it is not perfect.

#### Advanced Block Matching

For more specific matching, you can use object notation for `prev` and `next`:

```json
{
  "prev": "paragraph",
  "next": { "type": "list", "in": "list" },
  "blankLine": "never"
}
```

Object notation supports the following properties:

- `type`: The block type (same as string notation)
- `in`: (string) The container context where the block is located
  - `"list"` - Block is inside a list item
  - `"blockquote"` - Block is inside a blockquote
  - `"footnote-definition"` - Block is inside a footnote definition

#### Block Types

You can specify block types in two ways:

**String notation** (simple matching):

- `"blockquote"` - Blockquote elements

  e.g.

  ```md
  > Blockquote
  ```

- `"code"` - Code blocks

  e.g.

  ````md
  ```json
  "Code block"
  ```
  ````

- `"footnote-definition"` - Footnote definitions

  e.g.

  ```md
  [^footnote]: Footnote content
  ```

- `"frontmatter"` - Frontmatter sections (e.g., YAML frontmatter)

  e.g.

  ```md
  ---
  title: Document Title
  ---
  ```

- `"heading"` - Heading elements

  e.g.

  ```md
  # Heading
  ```

- `"html"` - HTML elements

  e.g.

  ```md
  <div>HTML content</div>
  ```

- `"link-definition"` - Link definitions

  e.g.

  ```md
  [link]: #link-definitions
  ```

- `"list"` - List elements

  e.g.

  ```md
  - List item
  ```

- `"paragraph"` - Paragraph elements

  e.g.

  ```md
  Paragraph text.
  ```

- `"table"` - Table elements

  e.g.

  ```md
  | Header | Header |
  | ------ | ------ |
  | Cell   | Cell   |
  ```

- `"thematic-break"` - Horizontal rules

  e.g.

  ```md
  ---
  ```

- `"custom-container"` - Custom container blocks

  e.g.

  ```md
  ::: custom
  Custom container content.
  :::
  ```

  This syntax is non-standard, but supported by some Markdown parsers like [markdown-it-container](https://github.com/markdown-it/markdown-it-container).\
  To check this, specify [`markdown-preferences/extended-syntax` as the `language`](../user-guide/index.md#using-extended-syntax).

- `"math"` - Math blocks

  e.g.

  ```md
  $$
  E = mc^2
  $$
  ```

  This syntax is non-standard, but supported by some Markdown parsers like [GitHub](https://docs.github.com/get-started/writing-on-github/working-with-advanced-formatting/writing-mathematical-expressions).\
  To check this, specify [`markdown-preferences/extended-syntax` as the `language`](../user-guide/index.md#using-extended-syntax).

- `"*"` - Wildcard matching any block type

**Object notation** (advanced matching):

- `{ "type": "blockquote" }` - Same as string notation
- `{ "type": "list", "in": "list" }` - List elements inside another list
- `{ "type": "paragraph", "in": "blockquote" }` - Paragraphs inside blockquotes
- `{ "type": "*", "in": "footnote-definition" }` - Any block inside footnote definitions

#### Spacing Values

- `"always"` - Require a blank line
- `"never"` - Disallow blank lines
- `"any"` - No spacing restrictions

### Special Cases for `never`

When using `"never"`, this rule will preserve blank lines in cases where removing them would change the semantic meaning of the Markdown content. For example, with setext headings, a paragraph followed immediately by `---` creates a setext heading, while a paragraph followed by a blank line and then `---` creates separate paragraph and thematic break elements.

This careful handling ensures that the rule maintains semantic correctness while still enforcing consistent spacing preferences.

<!-- prettier-ignore-start -->

```md
<!-- eslint markdown-preferences/padding-line-between-blocks: ["error", {"prev": "paragraph", "next": "thematic-break", "blankLine": "never"}] -->

<!-- ✓ GOOD - Setext-style heading -->

Here is some title.
---

<!-- ✓ GOOD - Paragraph and thematic break. A blank line is always required between them -->

Here is some text.

---
```

<!-- prettier-ignore-end -->

## 👫 Related Rules

- [markdown-preferences/no-multiple-empty-lines](./no-multiple-empty-lines.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.16.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/padding-line-between-blocks.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/padding-line-between-blocks.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/padding-line-between-blocks)
