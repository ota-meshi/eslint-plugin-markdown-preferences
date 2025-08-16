---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/emoji-notation"
description: "Enforce consistent emoji notation style in Markdown files."
---

# markdown-preferences/emoji-notation

> Enforce consistent emoji notation style in Markdown files.

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces a consistent style for emoji notation in Markdown documents. You can choose between the following styles:

- `unicode`: Use Unicode emoji characters (e.g., 😄)
- `colon`: Use colon-style notation (e.g., `:smile:`)

Enforcing a single notation helps maintain a consistent appearance and improves readability across your documentation, especially in collaborative or large-scale projects.

<!-- eslint-skip -->

### Examples

#### `prefer: "unicode"` (Default)

```md
<!-- eslint markdown-preferences/emoji-notation: ["error", {"prefer": "unicode"}] -->

<!-- ✓ GOOD -->

I love open source! 😄

<!-- ✗ BAD -->

I love open source! :smile:
```

#### `prefer: "colon"`

```md
<!-- eslint markdown-preferences/emoji-notation: ["error", {"prefer": "colon"}] -->

<!-- ✓ GOOD -->

I love open source! :smile:

<!-- ✗ BAD -->

I love open source! 😄
```

## 🔧 Options

```jsonc
{
  "markdown-preferences/emoji-notation": [
    "error",
    {
      "prefer": "unicode",
      "ignoreUnknown": true,
      "ignoreList": [":zzz:", "😺", "/^\\p{RGI_Emoji_Flag_Sequence}$/v"],
    },
  ],
}
```

- `prefer`: Specifies the preferred emoji notation style. Default is `"unicode"`.
  - `"unicode"`: Enforce Unicode emoji characters (e.g., 😄)
  - `"colon"`: Enforce colon-style emoji notation (e.g., `:smile:`)
- `ignoreUnknown`: If `true`, ignores unknown or unrecognized emoji notations (e.g., `:my-original-emoji:` or unknown Unicode emoji). Default is `true`.

  `ignoreList`: An array of emoji (Unicode or colon-style) and/or regular expression patterns (as string). \
  The specified strings and regular expressions in `ignoreList` are matched against both colon-style emoji names and their corresponding Unicode emoji, and vice versa. Any match will be suppressed and not reported as a violation.

  Specifically, specifying either `😺` or `:smiley_cat:` in `ignoreList` has the same effect.

  For example, if `ignoreList` contains `😺`:
  - When `prefer: "unicode"` is set, the colon-style emoji name `:smiley_cat:` will be suppressed.
  - When `prefer: "colon"` is set, the Unicode emoji `😺` will be suppressed.

  Similarly, if `ignoreList` contains `:smiley_cat:`:
  - When `prefer: "unicode"` is set, the colon-style emoji name `:smiley_cat:` will be suppressed.
  - When `prefer: "colon"` is set, the Unicode emoji `😺` will be suppressed.

### `ignoreUnknown`

```md
<!-- eslint markdown-preferences/emoji-notation: ["error", {"prefer": "unicode", "ignoreUnknown": true}] -->

<!-- ✓ GOOD -->

I love open source! 😄
I love open source! :my-original-emoji:

<!-- ✗ BAD (if ignoreUnknown: false) -->

I love open source! :smile:
```

With this option, custom or unknown emoji notations (e.g., `:my-original-emoji:`) will be ignored and not reported as violations, but known colon-style emoji (e.g., `:smile:`) will still be reported if not matching the preferred style.

### `ignoreList`

**Behavior with `"prefer": "unicode"`**

```md
<!-- eslint markdown-preferences/emoji-notation: ["error", {"prefer": "unicode", "ignoreList": [":zzz:", "😺", "/^\\p{RGI_Emoji_Flag_Sequence}$/v"]}] -->

<!-- ✓ GOOD -->

I love open source! 😄
I love open source! :zzz:
I love open source! :smiley_cat:
I love open source! :us:
I love open source! :jp:

<!-- ✗ BAD -->

I love open source! :smile:
```

In the above example, `ignoreList` is used with `"prefer": "unicode"` and contains the following elements. Each entry suppresses reporting for the corresponding colon-style emoji:

- `":zzz:"`: Suppresses reporting for the colon-style emoji name `:zzz:`.
- `"😺"`: Suppresses reporting for the colon-style emoji name `:smiley_cat:` (since both notations represent the same emoji).
- `"/^\\p{RGI_Emoji_Flag_Sequence}$/v"`: Suppresses reporting for colon-style flag names such as `:us:` and `:jp:` because they correspond to Unicode flag emoji (e.g., `🇺🇸`, `🇯🇵`) that match the pattern `/^\p{RGI_Emoji_Flag_Sequence}$/v`.

**Behavior with `"prefer": "colon"`**

```md
<!-- eslint markdown-preferences/emoji-notation: ["error", {"prefer": "colon", "ignoreList": [":zzz:", "😺", "/^\\p{RGI_Emoji_Flag_Sequence}$/v"]}] -->

<!-- ✓ GOOD -->

I love open source! :smile:
I love open source! 💤
I love open source! 😺
I love open source! 🇺🇸
I love open source! 🇯🇵

<!-- ✗ BAD -->

I love open source! 😄
```

In the above example, `ignoreList` is used with `"prefer": "colon"` and contains the following elements. Each entry suppresses reporting for the corresponding Unicode emoji:

- `":zzz:"`: Suppresses reporting for the Unicode emoji `💤` (since both notations represent the same emoji).
- `"😺"`: Suppresses reporting for the Unicode emoji `😺`.
- `"/^\\p{RGI_Emoji_Flag_Sequence}$/v"`: Suppresses reporting for Unicode flag emoji such as `🇺🇸` and `🇯🇵` because they match the pattern `/^\p{RGI_Emoji_Flag_Sequence}$/v`.

## 📚 Further Reading

- [GitHub Docs - Basic writing and formatting syntax: Using emojis](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax?apiVersion=2022-11-28&versionId=free-pro-team%40latest&category=emojis#using-emojis)
- [GitLab Docs - GitLab Flavored Markdown (GLFM): Emoji](https://docs.gitlab.com/user/markdown/#emoji)

## 👫 Related Rules

No direct related rules.

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/emoji-notation.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/emoji-notation.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/emoji-notation)
