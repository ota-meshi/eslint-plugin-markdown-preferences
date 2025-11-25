---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/indent"
description: "enforce consistent indentation in Markdown files"
since: "v0.24.0"
---

# markdown-preferences/indent

> enforce consistent indentation in Markdown files

- ⚙️ This rule is included in `plugin.configs.standard`.
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fix-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces consistent indentation for list items and blockquotes in Markdown files. It ensures that nested list items and blockquote lines are indented according to the configured style, improving readability and maintaining a uniform structure throughout the document.

For example, it checks that:

- List items at the same nesting level are indented consistently.
- Nested list items are properly indented relative to their parent item.
- Blockquote lines are aligned and indented as specified.

Incorrect indentation will be reported, and many issues can be automatically fixed with the `--fix` option.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/indent: 'error' -->

<!-- ✓ GOOD -->

## Heading

- List item 1
  - Nested list item 1
  - Nested list item 2
- List item 2

> Blockquote
> Blockquote line 2
> Blockquote line 3

<!-- ✗ BAD -->

 ## Heading

 -  List item 1
    - Nested list item 1
    -  Nested list item 2
 - List item 2

>Blockquote
>  Blockquote line 2
>   Blockquote line 3
```

<!-- prettier-ignore-end -->

To control the alignment of list item markers and blockquote markers, use [markdown-preferences/list-marker-alignment] and [markdown-preferences/blockquote-marker-alignment].

## 🔧 Options

```json
{
  "markdown-preferences/indent": [
    "error",
    {
      "listItems": {
        "first": 1,
        "other": "first",
        "relativeTo": "taskListMarkerEnd"
      }
    }
  ]
}
```

- `listItems`: Configures the indentation for list items. This option is an object with the following properties:
  - `first`: Sets the indentation for the first line. The following values can be used:
    - Integer value (`>= 1`): Sets the indentation to the specified number of spaces.
    - `"ignore"`: Skips enforcing indentation for the first line.
  - `other`: Sets the indentation for lines other than the first. The following values can be used. The default is `"first"`:
    - Integer value (`>= 2`): Sets the indentation to the specified number of spaces.
    - `"first"`: Sets the indentation to match the value of `first`.
    - `"minimum"`: Uses the minimum indentation required to maintain indentation.
  - `relativeTo`: When using a numeric value for indentation, sets the reference point for the indentation. The following values can be used. The default is `"markerEnd"`:
    - `"markerStart"`: Calculates indentation relative to the start position of the list marker.
    - `"markerEnd"`: Calculates indentation relative to the end position of the list marker.
    - `"taskListMarkerEnd"`: Calculates indentation relative to the end position of the task list marker. If the list item is a task list item (e.g., `- [ ]`), the indentation is calculated from the end of the task list marker. If it's a regular list item, it behaves like `"markerEnd"`.

Regardless of the option, if the calculated indentation does not fall within the range allowed by Markdown specifications, the indentation permitted by Markdown specifications will be applied.

### Examples

#### `listItems`

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/indent: ["error", {"listItems": {"first": 4, "other": 4, "relativeTo": "markerStart"}}] -->

<!-- ✓ GOOD -->

1.  Use 2 spaces after the item number, so the text itself is indented 4 spaces.
    Use a 4-space indent for wrapped text.
2.  Use 2 spaces again for the next item.

*   Use 3 spaces after a bullet, so the text itself is indented 4 spaces.
    Use a 4-space indent for wrapped text.
    1.  Use 2 spaces with numbered lists, as before.
        Wrapped text in a nested list needs an 8-space indent.
    2.  Looks nice, doesn't it?
*   Back to the bulleted list, indented 3 spaces.

<!-- ✗ BAD -->

1. Multi line
   text.
2. Single line text.

* Multi line
  text.
  1. Multi line
     text.
  2. Single line text.
* Single line text.
```

<!-- prettier-ignore-end -->

## 📚 Further Reading

- [Google Markdown Style Guide](https://google.github.io/styleguide/docguide/style.html)

## 👫 Related Rules

- [markdown-preferences/blockquote-marker-alignment]
- [markdown-preferences/list-marker-alignment]
- [markdown-preferences/no-multi-spaces](./no-multi-spaces.md)

[markdown-preferences/blockquote-marker-alignment]: ./blockquote-marker-alignment.md
[markdown-preferences/list-marker-alignment]: ./list-marker-alignment.md

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.24.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/indent.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/indent.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/indent)
