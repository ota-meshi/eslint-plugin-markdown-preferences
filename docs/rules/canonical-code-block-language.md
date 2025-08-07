---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/canonical-code-block-language"
description: "enforce canonical language names in code blocks"
---

# markdown-preferences/canonical-code-block-language

> enforce canonical language names in code blocks

- ❗ <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule enforces the use of canonical (standardized) language names in Markdown code blocks. It helps maintain consistency across your documentation by automatically converting language names to their preferred canonical forms. By default, it converts verbose language names to their shorter, more commonly used abbreviations.

<!-- eslint-skip -->

````md
<!-- eslint markdown-preferences/canonical-code-block-language: ['error', { languages: { javascript: 'js', typescript: 'ts', python: 'py' } }] -->

<!-- ✓ GOOD -->

```js
console.log("Hello, world!");
```

```ts
const message: string = "Hello, TypeScript!";
```

```py
print("Hello, Python!")
```

<!-- ✗ BAD -->

```javascript
console.log("Hello, world!");
```

```typescript
const message: string = "Hello, TypeScript!";
```

```python
print("Hello, Python!")
```
````

## 🔧 Options

```json
{
  "markdown-preferences/canonical-code-block-language": [
    "error",
    {
      "languages": {
        "javascript": "js",
        "jsx": "js",
        "typescript": "ts",
        "tsx": "ts",
        "python": "py",
        "bash": "sh",
        "shell": "sh",
        "zsh": "sh"
      }
    }
  ]
}
```

### `languages`

An object mapping language names to their preferred canonical equivalents.

- Type: `Record<string, string>`
- Default:

  ```json
  {
    "javascript": "js",
    "jsx": "js",
    "mjs": "js",
    "cjs": "js",
    "typescript": "ts",
    "tsx": "ts",
    "mts": "ts",
    "cts": "ts",
    "python": "py",
    "bash": "sh",
    "shell": "sh",
    "zsh": "sh",
    "yml": "yaml",
    "markdown": "md",
    "rust": "rs",
    "golang": "go",
    "cplusplus": "cpp",
    "c++": "cpp",
    "postgresql": "sql",
    "mysql": "sql",
    "sqlite": "sql"
  }
  ```

## 📚 Further Reading

- [CommonMark Spec: Fenced code blocks](https://spec.commonmark.org/0.31.2/#fenced-code-blocks)
- [GitHub Flavored Markdown: Fenced code blocks](https://github.github.com/gfm/#fenced-code-blocks)

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/canonical-code-block-language.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/canonical-code-block-language.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/canonical-code-block-language)
