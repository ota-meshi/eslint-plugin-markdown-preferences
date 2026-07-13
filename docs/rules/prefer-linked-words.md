---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/prefer-linked-words"
description: "enforce the specified word to be a link."
since: "v0.1.0"
---

# markdown-preferences/prefer-linked-words

> enforce the specified word to be a link.

- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fix-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces that specific words or phrases are always converted to links when they appear in Markdown text. This is useful for:

- Automatically linking project names to their repositories or documentation
- Ensuring technical terms link to their definitions
- Maintaining consistent reference linking across documentation
- Converting inline code references to their documentation pages
- Linking words that match a regular expression to a generated destination

### Examples

#### Basic Object Configuration

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/prefer-linked-words: ["error", { "words": { "ESLint": "https://eslint.org/" } }] -->

<!-- ✓ GOOD -->

[ESLint](https://eslint.org/) is a great linting tool.

Check out the [ESLint](https://eslint.org/) documentation.

<!-- ✗ BAD -->

ESLint is a great linting tool.

Check out the ESLint documentation.
```

#### Multiple Words Configuration

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/prefer-linked-words: ["error", { "words": { "TypeScript": "https://www.typescriptlang.org/", "Vite": "https://vitejs.dev/", "Prettier": "https://prettier.io/" } }] -->

<!-- ✓ GOOD -->

[TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), and [Prettier](https://prettier.io/) are popular development tools.

<!-- ✗ BAD -->

TypeScript, Vite, and Prettier are popular development tools.
```

#### Code References

The rule also works with inline code:

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/prefer-linked-words: ["error", { "words": { "console.log": "https://developer.mozilla.org/en-US/docs/Web/API/Console/log" } }] -->

<!-- ✓ GOOD -->

Use the [`console.log`](https://developer.mozilla.org/en-US/docs/Web/API/Console/log) method for debugging.

<!-- ✗ BAD -->

Use the `console.log` method for debugging.
```

#### Regular Expression Configuration

Write a `words` key in `/pattern/flags` notation to match a regular expression. Capturing groups can be referenced from the link with `$1`, `$2`, and so on.

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/prefer-linked-words: ["error", { "words": { "/([A-Z][a-z]+)\\.([a-z][A-Za-z]+)/u": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/$1/$2" } }] -->

<!-- ✓ GOOD -->

Use [Array.isArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray).

<!-- ✗ BAD -->

Use Array.isArray.
```

#### Array Configuration (Detection Only)

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/prefer-linked-words: ["error", { "words": ["TODO", "FIXME", "NOTE"] }] -->

<!-- ✓ GOOD - Will be reported but not auto-fixed -->

[TODO]: Review this section

<!-- ✗ BAD - Will be reported -->

TODO: Review this section
```

### When Not to Use

- If you prefer manual link management
- If you're working with content where certain words should intentionally not be links
- If you're using a documentation system that handles linking automatically

## 🔧 Options

```json
{
  "markdown-preferences/prefer-linked-words": [
    "error",
    {
      "words": {
        "ESLint": "https://eslint.org/",
        "Markdown": "https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Howto/Markdown_in_MDN",
        "TypeScript": "https://www.typescriptlang.org/"
      },
      "ignores": [
        {
          "node": { "type": "heading" }
        },
        {
          "node": { "type": "footnoteDefinition" }
        }
      ]
    }
  ]
}
```

- `words` (required): An object or array of words or regular expression patterns that should be linked. If an object, keys are the words or patterns and values are the URLs.
- `ignores` (optional): An array of objects that specify conditions under which the rule should not apply. Each object can have:
  - `words`: An array or string of words to ignore. If not specified, all words will be ignored.
  - `node`: An object specifying conditions for ignoring nodes.

### `words`

The rule accepts a single object with a `words` property that can be configured in two ways:

#### Object Configuration

```json
{
  "markdown-preferences/prefer-linked-words": [
    "error",
    {
      "words": {
        "ESLint": "https://eslint.org/",
        "Markdown": "https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Howto/Markdown_in_MDN",
        "TypeScript": "https://www.typescriptlang.org/"
      }
    }
  ]
}
```

With object configuration:

- **Keys**: The words, phrases, or regular expression patterns to detect
- **Values**: The URLs to link to
- **Auto-fix**: ✅ Available - words will be automatically converted to links

Keys written in `/pattern/flags` notation are interpreted as JavaScript regular expressions. For example, `"/eslint/iu"` matches `ESLint` case-insensitively. Matches use the same whole-word boundary checks as literal words.

For regular expression keys, `$1`, `$2`, and so on in the URL are replaced by the corresponding capturing groups. The matched text is used as the link label.

##### Value Format

- **URL**: A valid URL string
- **File Path**: A path to a local file. If the path points to a file being checked, the word is excluded from checking. When auto-fix, resolve to relative paths.
  - **Absolute**: A full path to a local file (e.g., `/Users/user/docs/guide.md`)
  - **Relative**: A path to a local file (e.g., `./docs/guide.md`). Relative paths are resolved relative to the `cwd`.

#### Array Configuration

```json
{
  "markdown-preferences/prefer-linked-words": [
    "error",
    {
      "words": ["TODO", "FIXME", "NOTE", "WARNING"]
    }
  ]
}
```

With array configuration:

- **Items**: The words, phrases, or regular expression patterns to detect. Strings in `/pattern/flags` notation are interpreted as JavaScript regular expressions.
- **Auto-fix**: ❌ Not available - only reports violations
- **Use case**: Good for identifying words that should be links but don't have predetermined URLs

### `ignores`

You can use the `ignores` option to exclude the rule application under specific conditions. Each ignore condition is an object with the following properties:

- `words` (optional): Specifies the matched words to ignore. Can be specified as an array or string. If not specified, all words will be targeted.
- `node` (optional): Specifies the ignore conditions by node type or properties. Excludes nodes where the specified properties match. For example, to exclude all heading levels (`h1` to `h6`), specify `{"type": "heading"}`, and to exclude only level 1 headings (`h1`), specify `{"type": "heading", "depth": 1}`.

#### Usage Examples

```json
{
  "markdown-preferences/prefer-linked-words": [
    "error",
    {
      "words": {
        "ESLint": "https://eslint.org/",
        "TypeScript": "https://www.typescriptlang.org/",
        "JavaScript": "https://developer.mozilla.org/en-US/docs/Web/JavaScript"
      },
      "ignores": [
        {
          "words": "ESLint",
          "node": { "type": "heading", "depth": 1 }
        },
        {
          "words": ["ESLint", "TypeScript"],
          "node": { "type": "listItem" }
        },
        {
          "node": { "type": "footnoteDefinition" }
        }
      ]
    }
  ]
}
```

In this configuration:

- "ESLint" in level 1 headings will be ignored
- "ESLint" and "TypeScript" in list items will be ignored
- All words in all footnotes will be ignored

#### Node Types and Properties

Please refer to the [mdast](https://github.com/syntax-tree/mdast) documentation for detailed properties of each node.

## 📚 Further Reading

- [CommonMark Spec: Links](https://spec.commonmark.org/0.31.2/#links)
- [GitHub Flavored Markdown: Links](https://github.github.com/gfm/#links)

## 👫 Related Rules

- [markdown-preferences/prefer-inline-code-words](prefer-inline-code-words.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.1.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/prefer-linked-words.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/prefer-linked-words.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/prefer-linked-words)
