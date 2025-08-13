---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/ordered-list-marker-sequence"
description: "enforce that ordered list markers use sequential numbers"
since: "v0.12.0"
---

# markdown-preferences/ordered-list-marker-sequence

> enforce that ordered list markers use sequential numbers

- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.
- 💡 Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

## 📖 Rule Details

This rule enforces that ordered list markers in Markdown use strictly sequential numbers. If the numbering skips, decreases, or starts with an unexpected value, this rule will report an error. The rule can automatically format and correct list numbers to ensure consistency throughout your document.

Key features:

- Ensures that ordered list markers always increase by one, regardless of how many lists are present in a document.
- Handles lists that are separated by paragraphs or other block elements, so numbering can continue across disconnected lists if appropriate.
- Prevents accidental mistakes such as duplicate, skipped, or reversed numbers, which can reduce readability and cause confusion in rendered Markdown.

This rule is especially useful when:

- Multiple people are editing Markdown documents and list numbering errors are likely to occur.
- You want to enforce strict consistency and clarity in documentation or code review processes.
- Some Markdown parsers or tools may render lists incorrectly if the numbering is not sequential.

By enforcing sequential numbering, this rule helps maintain high-quality, easy-to-read Markdown documents and prevents subtle formatting issues.

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

This rule has no options.

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
