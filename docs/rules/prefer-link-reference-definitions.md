---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/prefer-link-reference-definitions"
description: "enforce using link reference definitions instead of inline links"
since: "v0.6.0"
---

# markdown-preferences/prefer-link-reference-definitions

> enforce using link reference definitions instead of inline links

- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fix-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces the use of link reference definitions instead of inline links when the same URL is used multiple times (2 or more by default). This improves readability and maintainability of Markdown documents by keeping the link URLs organized at the bottom of sections.

The rule automatically converts inline links to reference links and adds the reference definitions at the end of the current section (before the next heading).

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/prefer-link-reference-definitions: 'error' -->

<!-- ✓ GOOD -->

- [ESLint] is a JavaScript linter.
- [ESLint][eslint] helps maintain code quality.

[eslint]: https://eslint.org

<!-- ✗ BAD -->

- [ESLint](https://eslint.org) is a JavaScript linter.
- [ESLint](https://eslint.org) helps maintain code quality.
```

## 🔧 Options

You can configure the minimum number of links required to trigger this rule and
ignore link destinations using ordered URL patterns.

```json
{
  "markdown-preferences/prefer-link-reference-definitions": [
    "error",
    {
      "minLinks": 2,
      "ignoreUrlPatterns": ["!/^https?:/iu"]
    }
  ]
}
```

- `minLinks`: The minimum number of links with the same URL to trigger the rule. Default is `2`.
- `ignoreUrlPatterns`: An ordered list of URL patterns to ignore. Default is `[]`.

### `minLinks`

The minimum number of links with the same URL to trigger the rule. Default is `2`.

- Must be a positive integer (minimum: 1)
- When set to `1`, all inline links will be converted to reference definitions
- When set to `2` or higher, only URLs that appear multiple times will be converted

### `ignoreUrlPatterns`

An ordered list of patterns for link and image URLs that the rule should ignore.
Patterns are matched against the parsed URL, without the link label or title.
Default is `[]`.

- Plain strings match complete URLs exactly.
- Regular expressions use the `/pattern/flags` format.
- A pattern prefixed with `!` removes matching URLs from the ignored set.
- Patterns are applied in order, so a later pattern can override an earlier one.
- If the first pattern is prefixed with `!`, all URLs are initially ignored.

For example, the following configuration ignores relative URLs and other
non-HTTP(S) URLs while continuing to check HTTP(S) URLs:

```json
{
  "markdown-preferences/prefer-link-reference-definitions": [
    "error",
    {
      "ignoreUrlPatterns": ["!/^https?:/iu"]
    }
  ]
}
```

Patterns can be layered to add and remove exceptions. The following
configuration checks HTTP(S) URLs, ignores URLs on `internal.example.com`, and
then checks its `/public` paths again:

```json
{
  "markdown-preferences/prefer-link-reference-definitions": [
    "error",
    {
      "ignoreUrlPatterns": [
        "!/^https?:/iu",
        "/^https?:[/]{2}internal[.]example[.]com(?::[0-9]+)?(?:[/]|[?#]|$)/iu",
        "!/^https?:[/]{2}internal[.]example[.]com(?::[0-9]+)?[/]public(?:[/]|[?#]|$)/iu"
      ]
    }
  ]
}
```

## 📚 Further Reading

- [CommonMark Spec: Reference Links](https://spec.commonmark.org/0.31.2/#link-reference-definitions)

## 👫 Related Rules

- [markdown-preferences/definitions-last](./definitions-last.md)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.6.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/prefer-link-reference-definitions.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/prefer-link-reference-definitions.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/prefer-link-reference-definitions)
