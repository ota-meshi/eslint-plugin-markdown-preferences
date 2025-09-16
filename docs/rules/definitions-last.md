---
pageClass: "rule-details"
sidebarDepth: 0
title: "markdown-preferences/definitions-last"
description: "require link definitions and footnote definitions to be placed at the end of the document"
since: "v0.7.0"
---

# markdown-preferences/definitions-last

> require link definitions and footnote definitions to be placed at the end of the document

- 🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## 📖 Rule Details

This rule requires link definitions (`[label]: URL`) and footnote definitions (`[^label]: text`) to be placed at the end of the document, after all other content.

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/definitions-last: 'error' -->

<!-- ✓ GOOD -->

# Example Document

## Section 1: Introduction

Welcome to our documentation. For more details, see [Project Overview].
You can also refer to [Project Overview] again in this section for emphasis.

Additionally, check out [User Guide] for another resource.

## Section 2: Resources

In this section, we mention [User Guide] as a useful link.

## Section 3: Notes (Single Section Footnote)

Here is a footnote for further explanation.[^about-section]
You can also refer to the same footnote again in this section.[^about-section]

## Section 4: Additional Notes (Multiple Sections Footnote)

This section references a footnote used in multiple sections.[^shared-note]

## Section 5: More Notes

This section also references the same footnote for completeness.[^shared-note]

[Project Overview]: https://example.com/project-overview
[User Guide]: https://example.com/user-guide

[^about-section]: This is a footnote definition referenced only from Section 3.

[^shared-note]: This is a footnote definition referenced from multiple sections (Section 4 and Section 5).
```

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/definitions-last: 'error' -->

<!-- ✗ BAD -->

# Example Document

## Section 1: Introduction

Welcome to our documentation. For more details, see [Project Overview].
You can also refer to [Project Overview] again in this section for emphasis.

Additionally, check out [User Guide] for another resource.

[Project Overview]: https://example.com/project-overview

## Section 2: Resources

In this section, we mention [User Guide] as a useful link.

[User Guide]: https://example.com/user-guide

## Section 3: Notes (Single Section Footnote)

Here is a footnote for further explanation.[^about-section]
You can also refer to the same footnote again in this section.[^about-section]

[^about-section]: This is a footnote definition referenced only from Section 3.

## Section 4: Additional Notes (Multiple Sections Footnote)

This section references a footnote used in multiple sections.[^shared-note]

[^shared-note]: This is a footnote definition referenced from multiple sections (Section 4 and Section 5).

## Section 5: More Notes

This section also references the same footnote for completeness.[^shared-note]
```

## 🔧 Options

```json
{
  "markdown-preferences/definitions-last": [
    "error",
    {
      "linkDefinitionPlacement": {
        "referencedFromSingleSection": "document-last", // "document-last", or "section-last",
        "referencedFromMultipleSections": "document-last" // "document-last", "first-reference-section-last", or "last-reference-section-last"
      },
      "footnoteDefinitionPlacement": {
        "referencedFromSingleSection": "document-last", // "document-last", or "section-last",
        "referencedFromMultipleSections": "document-last" // "document-last", "first-reference-section-last", or "last-reference-section-last"
      }
    }
  ]
}
```

This rule provides options to control where link and footnote definitions should be placed, depending on the number of references and the type of definition.

- `linkDefinitionPlacement`: Options for link reference definitions (`[label]: URL`).
  - `referencedFromSingleSection`: Where to place the definition when it is referenced only from a single section. Default is `"document-last"`.
    - `"document-last"`: At the end of the document.
    - `"section-last"`: At the end of the section where the reference appears.
  - `referencedFromMultipleSections`: Where to place the definition when it is referenced from two or more sections. Default is `"document-last"`.
    - `"document-last"`: At the end of the document.
    - `"first-reference-section-last"`: At the end of the section where the reference is first used.
    - `"last-reference-section-last"`: At the end of the section where the reference is last used.
- `footnoteDefinitionPlacement`: Options for footnote definitions (`[^label]: text`).
  - `referencedFromSingleSection`: Where to place the definition when it is referenced only from a single section. Default is `"document-last"`.
    - `"document-last"`: At the end of the document.
    - `"section-last"`: At the end of the section where the reference appears.
  - `referencedFromMultipleSections`: Where to place the definition when it is referenced from two or more sections. Default is `"document-last"`.
    - `"document-last"`: At the end of the document.
    - `"first-reference-section-last"`: At the end of the section where the reference is first used.
    - `"last-reference-section-last"`: At the end of the section where the reference is last used.

### Example With Options

#### Place Link Definitions at the Last of Each Reference Section (but at the Last of the Document If Referenced From Multiple Sections)

The following options place link definitions at the last of the section where the reference appears. However, if there are multiple references, the definition is placed at the last of the document.
Footnote definitions are always placed at the last of the document.

This is based on the [Google Markdown Style Guide](https://google.github.io/styleguide/docguide/style.html#define-reference-links-after-their-first-use).

```json
{
  "markdown-preferences/definitions-last": [
    "error",
    {
      "linkDefinitionPlacement": {
        "referencedFromSingleSection": "section-last",
        "referencedFromMultipleSections": "document-last"
      },
      "footnoteDefinitionPlacement": {
        "referencedFromSingleSection": "document-last",
        "referencedFromMultipleSections": "document-last"
      }
    }
  ]
}
```

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/definitions-last: [
    "error",
    {
      "linkDefinitionPlacement": {
        "referencedFromSingleSection": "section-last",
        "referencedFromMultipleSections": "document-last"
      },
      "footnoteDefinitionPlacement": {
        "referencedFromSingleSection": "document-last",
        "referencedFromMultipleSections": "document-last"
      }
    }
  ] -->

<!-- ✓ GOOD -->

# Example Document

## Section 1: Introduction

Welcome to our documentation. For more details, see [Project Overview].
You can also refer to [Project Overview] again in this section for emphasis.

Additionally, check out [User Guide] for another resource.

[Project Overview]: https://example.com/project-overview

## Section 2: Resources

In this section, we mention [User Guide] as a useful link.

## Section 3: Notes (Single Section Footnote)

Here is a footnote for further explanation.[^about-section]
You can also refer to the same footnote again in this section.[^about-section]

## Section 4: Additional Notes (Multiple Sections Footnote)

This section references a footnote used in multiple sections.[^shared-note]

## Section 5: More Notes

This section also references the same footnote for completeness.[^shared-note]

[User Guide]: https://example.com/user-guide

[^about-section]: This is a footnote definition referenced only from Section 3.

[^shared-note]: This is a footnote definition referenced from multiple sections (Section 4 and Section 5).
```

<!-- eslint-skip -->

```md
<!-- eslint markdown-preferences/definitions-last: [
    "error",
    {
      "linkDefinitionPlacement": {
        "referencedFromSingleSection": "section-last",
        "referencedFromMultipleSections": "document-last"
      },
      "footnoteDefinitionPlacement": {
        "referencedFromSingleSection": "document-last",
        "referencedFromMultipleSections": "document-last"
      }
    }
  ] -->

<!-- ✗ BAD -->

# Example Document

## Section 1: Introduction

Welcome to our documentation. For more details, see [Project Overview].
You can also refer to [Project Overview] again in this section for emphasis.

Additionally, check out [User Guide] for another resource.

## Section 2: Resources

In this section, we mention [User Guide] as a useful link.

[User Guide]: https://example.com/user-guide

## Section 3: Notes (Single Section Footnote)

Here is a footnote for further explanation.[^about-section]
You can also refer to the same footnote again in this section.[^about-section]

[^about-section]: This is a footnote definition referenced only from Section 3.

## Section 4: Additional Notes (Multiple Sections Footnote)

This section references a footnote used in multiple sections.[^shared-note]

[^shared-note]: This is a footnote definition referenced from multiple sections (Section 4 and Section 5).

## Section 5: More Notes

This section also references the same footnote for completeness.[^shared-note]

[Project Overview]: https://example.com/project-overview
```

## 📚 Further Reading

- [CommonMark Spec: Link Reference Definitions](https://spec.commonmark.org/0.31.2/#link-reference-definitions)
- [GitHub Flavored Markdown: Link Reference Definitions](https://github.github.com/gfm/#link-reference-definitions)
- [Google Markdown Style Guide: Reference](https://google.github.io/styleguide/docguide/style.html#reference)

## 👫 Related Rules

- [markdown-preferences/prefer-link-reference-definitions](./prefer-link-reference-definitions.md) - enforce using link reference definitions

## 🚀 Version

This rule was introduced in eslint-plugin-markdown-preferences v0.7.0

## 🔍 Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/src/rules/definitions-last.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/main/tests/src/rules/definitions-last.ts)
- [Test fixture sources](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/tree/main/tests/fixtures/rules/definitions-last)
