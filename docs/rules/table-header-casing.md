---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/table-header-casing"
description: "enforce consistent casing in table header cells."
---

# markdown-preferences/table-header-casing

> enforce consistent casing in table header cells.

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces consistent casing conventions for table header cells in Markdown tables. Proper capitalization improves readability and maintains a professional appearance in documentation tables.

### Examples

#### Default Configuration (`"Title Case"`)

The rule comes with extensive default values for `preserveWords` and `ignorePatterns`, making it work well out-of-the-box for technical documentation.

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/table-header-casing: 'error' -->

<!-- ✓ GOOD -->

| User Name | Date Of Birth | Favorite Color |
| --------- | ------------- | -------------- |
| Alice     | 2000-01-01    | Blue           |

<!-- ✗ BAD -->

| user name | date of birth | favorite color |
| --------- | ------------- | -------------- |
| Alice     | 2000-01-01    | Blue           |
```

#### With `"Sentence case"` Configuration

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/table-header-casing: ['error', { style: 'Sentence case' }] -->

<!-- ✓ GOOD -->

| User name | Date of birth | Favorite color |
| --------- | ------------- | -------------- |
| Alice     | 2000-01-01    | Blue           |

<!-- ✗ BAD -->

| User Name | Date Of Birth | Favorite Color |
| --------- | ------------- | -------------- |
| Alice     | 2000-01-01    | Blue           |
```

#### With `preserveWords` Option

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/table-header-casing: ['error', { style: 'Title Case', preserveWords: ['GitHub', 'iPhone', 'YouTube', 'API', 'GraphQL'] }] -->

<!-- ✓ GOOD -->

| GitHub | iPhone | YouTube | API | GraphQL |
| ------ | ------ | ------- | --- | ------- |
| foo    | bar    | baz     | qux | quux    |

<!-- ✗ BAD -->

| Github | Iphone | Youtube | Api | Graphql |
| ------ | ------ | ------- | --- | ------- |
| foo    | bar    | baz     | qux | quux    |
```

#### Using `ignorePatterns` for Technical Terms

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/table-header-casing: ['error', { style: 'Title Case', ignorePatterns: ['/_token$/u'] }] -->

<!-- ✓ GOOD -->

| access_token | refresh_token |
| ------------ | ------------- |
| abc          | xyz           |

<!-- ✗ BAD -->

| user_id | password |
| ------- | -------- |
| abc     | xyz      |
```

#### Customizing `minorWords` for Title Case

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/table-header-casing: ['error', { style: 'Title Case', minorWords: ['a', 'the', 'and', 'or', 'but', 'of', 'in', 'on', 'at', 'to', 'for', 'with'] }] -->

<!-- ✓ GOOD -->

| A Guide to Writing with Custom Minor Words |
| ------------------------------------------ |

<!-- ✗ BAD -->

| A Guide To Writing With Custom Minor Words |
| ------------------------------------------ |
```

### When Not to Use

- If your project uses specific branding or technical terms that require non-standard capitalization
- If you're working with existing content that has deliberate capitalization choices
- If your documentation uses a different style guide that conflicts with title case or sentence case

## 🔧 Options

```json
{
  "markdown-preferences/table-header-casing": [
    "error",
    {
      "style": "Title Case", // or "Sentence case"
      "preserveWords": ["ESLint", "JavaScript", "TypeScript"], // optional
      "ignorePatterns": ["/^v\\d+/u", "/\\w+\\.[a-z\\d]+$/u"], // optional
      "minorWords": ["a", "an", "the", "and", "or", "but"] // optional
    }
  ]
}
```

- `style` (optional): The casing style to enforce for table header cells. Can be `"Title Case"` (default) or `"Sentence case"`.
- `preserveWords` (optional): An array of words that should be preserved with their exact casing, regardless of the chosen style. The matching is case-insensitive. Includes extensive defaults for common technical terms.
- `ignorePatterns` (optional): An array of regular expression patterns for words that should be ignored during casing checks. Words matching any of these patterns will be left unchanged. Includes useful defaults for version numbers, file extensions, and technical patterns.
- `minorWords` (optional): An array of words that should not be capitalized in Title Case (unless they're the first or last word). Includes defaults for articles, conjunctions, and prepositions.

### `style` (`string`)

The casing style to enforce for table header cells.

**Available Options:**

- `"Title Case"` (default): Enforces Title Case capitalization where major words are capitalized. Articles, conjunctions, and short prepositions remain lowercase unless they are the first or last word.
- `"Sentence case"`: Enforces Sentence case capitalization where only the first letter of the cell is capitalized, and the rest are lowercase.

### `preserveWords` (`string[]`)

An array of words that should be preserved with their exact casing, regardless of the chosen style. The matching is case-insensitive.

**Example:**

```json
{
  "preserveWords": ["ESLint", "JavaScript", "TypeScript", "HTML", "CSS", "JSON"]
}
```

**Default Values:**

The rule comes with an extensive list of common technical terms as default values.

Please see the [defaultPreserveWords](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/resources/preserve-words.ts) for the complete list.

You can also import and use the default preserve words in your JavaScript code:

```js
import plugin from "eslint-plugin-markdown-preferences";

// Use in your ESLint configuration
export default {
  plugins: ["markdown-preferences"],
  rules: {
    "markdown-preferences/table-header-casing": [
      "error",
      {
        style: "Title Case",
        preserveWords: [
          ...plugin.resources.defaultPreserveWords, // Include all default words
          "MyCustomBrand", // Add your custom words
          "MyAPI",
        ],
      },
    ],
  },
};
```

### `ignorePatterns` (`string[]`)

An array of regular expression patterns for words that should be ignored during casing checks. Words matching any of these patterns will be left unchanged.

**Example:**

```json
{
  "ignorePatterns": [
    "/^v\\d+/u", // Version numbers starting with 'v' (e.g., v1, v2.0.1)
    "/\\w+\\.[a-z\\d]+$/u", // File extensions and names (e.g., config.json, package.json, index.html)
    "/\\w+(?:API|Api)$/u", // Words ending with API (e.g., webAPI, restAPI)
    "/\\w+(?:SDK|Sdk)$/u", // Words ending with SDK (e.g., nodeSDK, javaSDK)
    "/\\w+(?:CLI|Cli)$/u" // Words ending with CLI (e.g., nodeCLI, gitCLI)
  ]
}
```

**Default Values:**

The rule includes several useful default patterns:

- `/^v\\d+/u` - Version numbers starting with 'v' (e.g., v1.2.3, v2.0.1)
- `/\\w+\\.[a-z\\d]+$/u` - File extensions and names (e.g., config.json, package.json, index.html)
- `/\\w*(?:API|Api)$/u` - Words ending with API (e.g., webAPI, restAPI)
- `/\\w*(?:SDK|Sdk)$/u` - Words ending with SDK (e.g., nodeSDK, javaSDK)
- `/\\w*(?:CLI|Cli)$/u` - Words ending with CLI (e.g., nodeCLI, gitCLI)

This is particularly useful for:

- **Version numbers**: v1.0.0, 2.5.1
- **Technical identifiers**: API_KEY, config.json, camelCase
- **File names**: package.json, tsconfig.json
- **Code patterns**: snake_case, kebab-case
- **Numbers**: test123, rule1, step2

**Note**: If a pattern is invalid (e.g., contains syntax errors), it will be silently ignored and won't affect the rule's operation.

### `minorWords` (`string[]`)

An array of words that should not be capitalized in Title Case (unless they're the first or last word). This option allows you to customize which words are considered "minor" words in your documentation.

**Example:**

```json
{
  "minorWords": [
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "of",
    "in",
    "on",
    "at",
    "to",
    "for",
    "with"
  ]
}
```

**Default Values:**

The rule comes with a comprehensive list of common English minor words:

Please see the [defaultMinorWords](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/resources/minor-words.ts) for the complete list.

You can also import and use the default minor words in your JavaScript code:

```js
import plugin from "eslint-plugin-markdown-preferences";

// Use in your ESLint configuration
export default {
  plugins: ["markdown-preferences"],
  rules: {
    "markdown-preferences/table-header-casing": [
      "error",
      {
        style: "Title Case",
        minorWords: [
          ...plugin.resources.defaultMinorWords, // Include all default minor words
          "via", // Add your custom minor words
          "per",
        ],
      },
    ],
  },
};
```

**Usage Example:**

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/table-header-casing: ['error', { style: 'Title Case', minorWords: ['a', 'the', 'and', 'or', 'but', 'of', 'in', 'on', 'at', 'to', 'for', 'with'] }] -->

<!-- ✓ GOOD -->

| A Guide to Writing with Custom Minor Words |
| ------------------------------------------ |

<!-- ✗ BAD -->

| A Guide To Writing With Custom Minor Words |
| ------------------------------------------ |
```

This option is only effective when `style` is set to `"Title Case"`. In `"Sentence case"`, all words except the first one are lowercase regardless of this setting.

## 📚 Further Reading

- [Wikipedia: Title case](https://en.wikipedia.org/wiki/Title_case)
- [Wikipedia: Sentence case](https://en.wikipedia.org/wiki/Letter_case#Sentence_case)
- [Microsoft Writing Style Guide: Capitalization](https://docs.microsoft.com/en-us/style-guide/capitalization)
- [Google Developer Documentation Style Guide: Capitalization](https://developers.google.com/style/capitalization)

## 👫 Related Rules

- [markdown-preferences/heading-casing](./heading-casing.md)

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/table-header-casing.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/table-header-casing.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/table-header-casing)
