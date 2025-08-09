---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/no-laziness-blockquotes"
description: "disallow laziness in blockquotes"
since: "v0.10.0"
---

# markdown-preferences/no-laziness-blockquotes

> disallow laziness in blockquotes

- ⚙️ This rule is included in `plugin.configs.recommended`.
- 💡 Some problems reported by this rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

## 📖 Rule Details

This rule enforces that all lines within blockquotes must be properly prefixed with the `>` marker, preventing the use of "lazy" continuation lines as defined in the [CommonMark specification].

In CommonMark, blockquotes support "laziness," which allows continuation lines to omit the `>` marker. However, this can lead to inconsistent formatting and make blockquotes harder to read and maintain.

**Why this matters for clarity:**

When lazy continuation lines are used, it can be ambiguous whether the author intended the text to be part of the blockquote or as separate content. This ambiguity can confuse readers and make the document structure unclear. By requiring explicit `>` markers on all lines, the author's intent becomes unambiguous, making the document more readable and maintainable.

Consider this example:

<!-- prettier-ignore-start -->

```md
> This is a blockquote about an important topic.
This line could be interpreted as either:
```

<!-- prettier-ignore-end -->

1. A continuation of the blockquote (lazy syntax)
2. A separate paragraph that follows the blockquote

With this rule enabled, the author must explicitly choose their intent:

```md
<!-- Intent: Continue the blockquote -->

> This is a blockquote about an important topic.
> This line is clearly part of the blockquote.

<!-- Intent: Separate paragraph -->

> This is a blockquote about an important topic.

This line is clearly a separate paragraph.
```

**Nested blockquotes can be particularly confusing:**

In deeply nested blockquotes, lazy continuation lines can create unexpected interpretations. For example:

<!-- prettier-ignore-start -->

```md
> Level 1 start
> > Level 2 start
> > > Level 3 start
> > This looks like level 2 text but is actually lazy for level 3
> This looks like level 1 text but is actually lazy for level 3
> > This looks like level 2 text but is actually lazy for level 3
```

<!-- prettier-ignore-end -->

In this example, each line visually appears to belong to different blockquote levels based on the number of `>` markers (level 2, level 1, and level 2 respectively). However, according to CommonMark's lazy continuation rules, all these lines are actually interpreted as **level 3 content** because they follow the deepest nested blockquote (`> > > Level 3 start`). This creates a significant discrepancy between what the author likely intended (mixed nesting levels) and how the content is actually interpreted (all as level 3), making the document structure confusing and potentially misleading.

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/no-laziness-blockquotes: 'error' -->

<!-- ✓ GOOD -->

> This is a blockquote
> with all lines properly marked
> and easy to read.

> This is a blockquote
>
> with a blank line in between.

> This is a blockquote
>
> > with nested blockquotes
> > that are also properly marked.

<!-- ✗ BAD -->

> This is a blockquote
with a lazy continuation line

> This is a blockquote
>
> > Nested blockquote
but this is lazy

> First line is proper
lazy second line
> Third line is proper again
another lazy line

> Level 1 start
> > Level 2 start
> > > Level 3 start
> > This looks like level 2 text but is actually lazy for level 3
> > > Level 3 continues
> This looks like level 1 text but is actually lazy for level 3
> > This looks like level 2 text but is actually lazy for level 3
> This looks like level 1 text but is actually lazy for level 3.
> However, this level 1-looking content will not be reported
> because the previous line's intent (level 2 vs level 3) is ambiguous and cannot be correctly determined.
> If the previous line intended level 2, this content might be level 1 or level 2.
> But if the previous line intended level 3, this content might be level 1 or level 3.
```

<!-- prettier-ignore-end -->

[CommonMark specification]: https://spec.commonmark.org/0.31.2/#block-quotes

## 💡 When to Use This Rule

Use this rule when you want to:

- Ensure consistent formatting in blockquotes
- Make blockquotes more readable and maintainable
- Prevent confusion about what content belongs to a blockquote
- Follow strict CommonMark practices without laziness

## 🔧 Options

This rule has no options.

## 📚 Further Reading

- [CommonMark Spec: Block quotes][CommonMark specification]
- [CommonMark Spec: Laziness in block quotes](https://spec.commonmark.org/0.31.2/#example-232)

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.10.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/no-laziness-blockquotes.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/no-laziness-blockquotes.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/no-laziness-blockquotes)
