---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/prefer-linked-words"
description: "enforce the specified word to be a link."
since: "v0.1.0"
---

# markdown-preferences/prefer-linked-words

> enforce the specified word to be a link.

- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces that specific words or phrases are always converted to links when they appear in Markdown text. This is useful for:

- Automatically linking project names to their repositories or documentation
- Ensuring technical terms link to their definitions
- Maintaining consistent reference linking across documentation
- Converting inline code references to their documentation pages

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

The rule accepts a single object with a `words` property that can be configured in two ways:

### Object Configuration

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

- **Keys**: The words or phrases to detect (case-sensitive)
- **Values**: The URLs to link to
- **Auto-fix**: ✅ Available - words will be automatically converted to links

#### Value Format

- **URL**: A valid URL string
- **File Path**: A path to a local file. If the path points to a file being checked, the word is excluded from checking. When auto-fix, resolve to relative paths.
  - **Absolute**: A full path to a local file (e.g., `/Users/user/docs/guide.md`)
  - **Relative**: A path to a local file (e.g., `./docs/guide.md`). Relative paths are resolved relative to the `cwd`.

### Array Configuration

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

- **Items**: The words or phrases to detect
- **Auto-fix**: ❌ Not available - only reports violations
- **Use case**: Good for identifying words that should be links but don't have predetermined URLs

## 📚 Further reading

- [CommonMark Spec: Links](https://spec.commonmark.org/0.31.2/#links)
- [GitHub Flavored Markdown: Links](https://github.github.com/gfm/#links)

## 👫 Related rules

- [markdown-preferences/prefer-inline-code-words](prefer-inline-code-words.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.1.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/prefer-linked-words.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/prefer-linked-words.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/prefer-linked-words)
