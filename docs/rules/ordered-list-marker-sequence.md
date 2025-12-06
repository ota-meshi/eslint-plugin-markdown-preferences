---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/ordered-list-marker-sequence"
description: "enforce that ordered list markers use sequential numbers"
since: "v0.12.0"
---

# markdown-preferences/ordered-list-marker-sequence

> enforce that ordered list markers use sequential numbers

- ⚙️ This rule is included in `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fix-problems) can automatically fix some of the problems reported by this rule.
- 💡 Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/latest/use/core-concepts/#rule-suggestions).

## 📖 Rule Details

This rule enforces consistent numbering in ordered list markers. By default, it requires strictly sequential numbers (1, 2, 3, ...). Alternatively, you can configure it to enforce that all items use `1.` as the marker.

Using `1.` for all items simplifies maintenance, makes diffs cleaner, and reduces the chance of renumbering errors when reordering or inserting new list items. All major Markdown parsers render the list with proper sequential numbers regardless of the actual marker values.

Key features:

- Default behavior (`increment: "always"`): Ensures that ordered list markers always increase by one, regardless of how many lists are present in a document.
- Alternative behavior (`increment: "never"`): Enforces that all list items use `1.` (or `1)`) as the marker.
- Handles lists that are separated by paragraphs or other block elements.
- Prevents accidental mistakes such as duplicate, skipped, or reversed numbers, which can reduce readability and cause confusion in rendered Markdown.

This rule is especially useful when:

- Multiple people are editing Markdown documents and list numbering errors are likely to occur.
- You want to enforce strict consistency and clarity in documentation or code review processes.
- You prefer simplified maintenance with `1.` markers that avoid renumbering when list items are reordered.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/ordered-list-marker-sequence: 'error' -->

## Basic Example

<!-- ✓ GOOD -->

1. foo
2. bar
3. baz

<!-- ✗ BAD -->

1. foo
3. bar
4. baz

<!-- ✗ BAD -->

3. foo
2. bar
1. baz

## Example of Disconnected Lists

<!-- ✓ GOOD -->

1. foo
2. bar
3. baz

paragraph

4. qux
5. quux

<!-- ✗ BAD -->

1. foo
3. bar
4. baz

paragraph

5. qux
7. quux

## Example of Nested Lists

<!-- ✓ GOOD -->

1. foo
2. bar
   1. nested
   2. nested2
3. baz

<!-- ✗ BAD -->

1. foo
2. bar
   1. nested
   3. nested2
3. baz
```

<!-- prettier-ignore-end -->

## 🔧 Options

This rule has an optional configuration object with the following property:

- `increment` (default: `"always"`): Controls how list markers should be numbered.
  - `"always"`: Requires sequential numbering (1, 2, 3, ...)
  - `"never"`: Requires all items to use `1.` or `1)` as the marker

### Default Configuration (`increment: "always"`)

This is the default behavior when no options are specified.

<!-- eslint-skip -->

```json
{
  "markdown-preferences/ordered-list-marker-sequence": [
    "error",
    { "increment": "always" }
  ]
}
```

<!-- eslint-skip -->

```md
<!-- ✓ GOOD -->

1. foo
2. bar
3. baz

<!-- ✗ BAD -->

1. foo
1. bar
1. baz
```

### Alternative Configuration (`increment: "never"`)

When set to `"never"`, all list items must use `1.` (or `1)` if using parenthesis markers).

<!-- eslint-skip -->

```json
{
  "markdown-preferences/ordered-list-marker-sequence": [
    "error",
    { "increment": "never" }
  ]
}
```

<!-- eslint-skip -->

```md
<!-- ✓ GOOD -->

1. foo
1. bar
1. baz

<!-- Also valid with parenthesis markers -->

1) foo
1) bar
1) baz

<!-- ✗ BAD -->

1. foo
2. bar
3. baz
```

## 📚 Further Reading

- [CommonMark: List items](https://spec.commonmark.org/0.31.2/#list-items)

## 👫 Related Rules

- [markdown-preferences/ordered-list-marker-start](./ordered-list-marker-start.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.12.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/ordered-list-marker-sequence.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/ordered-list-marker-sequence.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/ordered-list-marker-sequence)
