---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/no-trailing-spaces"
description: "disallow trailing whitespace at the end of lines in Markdown files."
since: "v0.3.0"
---

# markdown-preferences/no-trailing-spaces

> disallow trailing whitespace at the end of lines in Markdown files.

- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule disallows trailing whitespace (spaces and tabs) at the end of lines in Markdown files.

While trailing spaces in Markdown can be used to create hard line breaks (when followed by a line break), they are often unintentional and can cause formatting inconsistencies. This rule helps maintain clean, consistent Markdown files by removing unnecessary trailing whitespace.

**Note**: This rule preserves intentional hard line breaks created with two trailing spaces followed by a line break.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/no-trailing-spaces: 'error' -->

<!-- ✓ GOOD: Two spaces for hard line break -->

foo  
bar

<!-- ✓ GOOD: No trailing spaces -->

foo
bar

<!-- ✗ BAD: Trailing spaces on empty line -->

foo  

bar

<!-- ✗ BAD: Trailing spaces not followed by content -->

foo  
bar  

<!--EOF-->
```

<!-- prettier-ignore-end -->

## 🔧 Options

```json
{
  "markdown-preferences/no-trailing-spaces": [
    "error",
    {
      "skipBlankLines": false,
      "ignoreComments": false
    }
  ]
}
```

- `skipBlankLines` (optional): When `true`, the rule ignores trailing spaces on empty lines. Default is `false`.
- `ignoreComments` (optional): When `true`, the rule ignores trailing spaces in HTML comment lines. Default is `false`.

### `skipBlankLines` (Default: `false`)

When `true`, the rule ignores trailing spaces on empty lines.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/no-trailing-spaces: ['error', { "skipBlankLines": false }] -->
<!-- ✗ BAD -->
   

<!--EOF-->
```

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/no-trailing-spaces: ['error', { "skipBlankLines": true }] -->
<!-- ✓ GOOD -->
   

<!--EOF-->
```

<!-- prettier-ignore-end -->

### `ignoreComments` (Default: `false`)

When `true`, the rule ignores trailing spaces in HTML comment lines.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/no-trailing-spaces: ['error', { "ignoreComments": false }] -->
<!-- ✗ BAD -->
<!--
  This is a comment 
-->
```

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/no-trailing-spaces: ['error', { "ignoreComments": true }] -->
<!-- ✓ GOOD -->
<!--
  This is a comment 
-->
```

<!-- prettier-ignore-end -->

## 💡 When to Use This Rule

Use this rule when you want to:

- Maintain consistent whitespace formatting in Markdown files
- Keep your version control diffs clean (trailing spaces often show up as noise)
- Ensure consistent code style across your team

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.3.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/no-trailing-spaces.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/no-trailing-spaces.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/no-trailing-spaces)
