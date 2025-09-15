# Comparison With markdownlint Rules

<!-- eslint
  markdown-preferences/prefer-link-reference-definitions: ["error", { "minLinks": 1 }],
  markdown-preferences/definitions-last: ["error"]
  -->

`eslint-plugin-markdown-preferences` does not aim for compatibility with [markdownlint], but comparing rules is useful to check the strengths of each.\
Also, by combining [markdownlint] and using each rule, you may be able to achieve the optimal Markdown style for you.\
`eslint-plugin-markdown-preferences` is designed to provide useful features when used together with [@eslint/markdown], so rules from [@eslint/markdown] are also compared.

Please note that each OSS is constantly evolving, so this list is not exhaustive.

## Rules Related to Headings

| Description                                             | [markdownlint] Rules                                                                                | [@eslint/markdown] Rules                                                                               | `eslint-plugin-markdown-preferences` Rules                                                                                                      |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading levels should only increment by one             | [MD001] _heading-increment_<br>Heading levels should only increment by one level at a time          | [markdown/heading-increment]<br>Enforce heading levels increment by one                                | --                                                                                                                                              |
| Level 1 Heading notation style                          | [MD003] _heading-style_<br>Heading style                                                            | --                                                                                                     | -- [markdown-preferences/level1-heading-style]<br>enforce consistent style for level 1 headings                                                 |
| Level 2 Heading notation style                          | [MD003] _heading-style_<br>Heading style                                                            | --                                                                                                     | [markdown-preferences/level2-heading-style]<br>enforce consistent style for level 2 headings                                                    |
| ATX heading closing `#` presence                        | [MD003] _heading-style_<br>Heading style                                                            | --                                                                                                     | [markdown-preferences/atx-heading-closing-sequence]<br>enforce consistent use of closing sequence in ATX headings.                              |
| ATX heading closing `#` length                          |                                                                                                     |                                                                                                        | [markdown-preferences/atx-heading-closing-sequence-length]<br>enforce consistent length for the closing sequence (trailing #s) in ATX headings. |
| Require space after ATX heading `#`                     | [MD018] _no-missing-space-atx_<br>No space after hash on atx style heading                          | [markdown/no-missing-atx-heading-space]<br>Disallow headings without a space after the hash characters | --                                                                                                                                              |
| Disallow multiple spaces after ATX heading `#`          | [MD019] _no-multiple-space-atx_<br>Multiple spaces after hash on atx style heading                  | --                                                                                                     | [markdown-preferences/no-multi-spaces]<br>disallow multiple spaces                                                                              |
| Require space before closing ATX heading `#`            | [MD020] _no-missing-space-closed-atx_<br>No space inside hashes on closed atx style heading         | --                                                                                                     | --                                                                                                                                              |
| Disallow multiple spaces before closing ATX heading `#` | [MD021] _no-multiple-space-closed-atx_<br>Multiple spaces inside hashes on closed atx style heading | --                                                                                                     | [markdown-preferences/no-multi-spaces]<br>disallow multiple spaces                                                                              |
| Require empty lines around headings                     | [MD022] _blanks-around-headings_<br>Headings should be surrounded by blank lines                    | --                                                                                                     | [markdown-preferences/padding-line-between-blocks]<br>require or disallow padding lines between block elements                                  |
| Heading indentation                                     | [MD023] _heading-start-left_<br>Headings must start at the beginning of the line                    | --                                                                                                     | [markdown-preferences/indent]<br>enforce consistent indentation in Markdown files                                                               |
| Disallow duplicate headings                             | [MD024] _no-duplicate-heading_<br>Multiple headings with the same content                           | [markdown/no-duplicate-headings]<br>Disallow duplicate headings in the same document                   | --                                                                                                                                              |
| Limit to one `<h1>` heading                             | [MD025] _single-title/single-h1_<br>Multiple top-level headings in the same document                | [markdown/no-multiple-h1]<br>Disallow multiple H1 headings in the same document                        | --                                                                                                                                              |
| Disallow trailing punctuation in headings               | [MD026] _no-trailing-punctuation_<br>Trailing punctuation in heading                                | --                                                                                                     | --                                                                                                                                              |
| Require emphasis-like headings to be real headings      | [MD036] _no-emphasis-as-heading_<br>Emphasis used instead of a heading                              | --                                                                                                     | --                                                                                                                                              |
| Require heading at the start of document                | [MD041] _first-line-heading/first-line-h1_<br>First line in a file should be a top-level heading    | --                                                                                                     | --                                                                                                                                              |
| Enforce preferred heading structure                     | [MD043] _required-headings_<br>Required heading structure                                           | --                                                                                                     | --                                                                                                                                              |
| Headings casing                                         | --                                                                                                  | --                                                                                                     | [markdown-preferences/heading-casing]<br>enforce consistent casing in headings                                                                  |
| Setext heading underline length                         | --                                                                                                  | --                                                                                                     | [markdown-preferences/setext-heading-underline-length]<br>enforce consistent underline length.                                                  |

## Rules Related to Lists

| Description                         | [markdownlint] Rules                                                               | [@eslint/markdown] Rules | `eslint-plugin-markdown-preferences` Rules                                                                      |
| ----------------------------------- | ---------------------------------------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `<ul>` notation style               | [MD004] _ul-style_<br>Unordered list style                                         | --                       | [markdown-preferences/bullet-list-marker-style]<br>enforce consistent bullet list (unordered list) marker style |
| List indentation                    | [MD005] _list-indent_<br>Inconsistent indentation for list items at the same level | --                       | [markdown-preferences/list-marker-alignment]<br>enforce consistent alignment of list markers                    |
| `<ul>` indentation                  | [MD007] _ul-indent_<br>Unordered list indentation                                  | --                       | [markdown-preferences/indent]<br>enforce consistent indentation in Markdown files                               |
| Enforce `<ol>` marker sequence      | [MD029] _ol-prefix_<br>Ordered list item prefix                                    | --                       | [markdown-preferences/ordered-list-marker-sequence]<br>enforce that ordered list markers use sequential numbers |
| Enforce `<ol>` marker start         | [MD029] _ol-prefix_<br>Ordered list item prefix                                    | --                       | [markdown-preferences/ordered-list-marker-start]<br>enforce that ordered list markers start with 1 or 0         |
| Enforce `<ol>` marker style         |                                                                                    | --                       | [markdown-preferences/ordered-list-marker-style]<br>enforce consistent ordered list marker style                |
| Consistent spaces after list marker | [MD030] _list-marker-space_<br>Spaces after list markers                           | --                       | [markdown-preferences/indent]<br>enforce consistent indentation in Markdown files                               |
| Require empty lines around lists    | [MD032] _blanks-around-lists_<br>Lists should be surrounded by blank lines         | --                       | [markdown-preferences/padding-line-between-blocks]<br>require or disallow padding lines between block elements  |

## Rules Related to Links and Images

| Description                                     | [markdownlint] Rules                                                                              | [@eslint/markdown] Rules                                                                             | `eslint-plugin-markdown-preferences` Rules                                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Disallow bare URLs                              | [MD034] _no-bare-urls_<br>Bare URL used                                                           | [markdown/no-bare-urls]<br>Disallow bare URLs                                                        | [markdown-preferences/prefer-autolinks]<br>enforce the use of autolinks for URLs                                  |
| Spaces around the text in links                 | [MD039] _no-space-in-links_<br>Spaces inside link text                                            | --                                                                                                   | [markdown-preferences/link-bracket-spacing]<br>enforce consistent spacing inside link brackets                    |
| Disallow empty links                            | [MD042] _no-empty-links_<br>No empty links                                                        | [markdown/no-empty-links]<br>Disallow empty links                                                    | --                                                                                                                |
| Disallow empty images                           | --                                                                                                | [markdown/no-empty-images]<br>Disallow empty images                                                  | --                                                                                                                |
| Enforce alt text for images                     | [MD045] _no-alt-text_<br>Images should have alternate text (alt text)                             | [markdown/require-alt-text]<br>Require alternative text for images                                   | --                                                                                                                |
| Disallow missing reference for link fragments   | [MD051] _link-fragments_<br>Link fragments should be valid                                        | [markdown/no-missing-link-fragments]<br>Disallow link fragments that do not reference valid headings | --                                                                                                                |
| Disallow missing reference for links/images     | [MD052] _reference-links-images_<br>Reference links and images should use a label that is defined | [markdown/no-missing-label-refs]<br>Disallow missing label references                                | --                                                                                                                |
| Link and image notation style                   | [MD054] _link-image-style_<br>Link and image style                                                | --                                                                                                   | --                                                                                                                |
| Require descriptive link text                   | [MD059] _descriptive-link-text_<br>Link text should be descriptive                                | --                                                                                                   | --                                                                                                                |
| Enforce specific words to be links              | --                                                                                                | --                                                                                                   | [markdown-preferences/prefer-linked-words]<br>enforce the specified word to be a link                             |
| Spaces around the brackets in links/images      | --                                                                                                | --                                                                                                   | [markdown-preferences/link-bracket-spacing]<br>enforce consistent spacing inside link brackets                    |
| Newlines around the brackets in links/images    | --                                                                                                | --                                                                                                   | [markdown-preferences/link-bracket-newline]<br>enforce linebreaks after opening and before closing link brackets  |
| Spaces around the parentheses in links/images   | --                                                                                                | --                                                                                                   | [markdown-preferences/link-paren-spacing]<br>enforce consistent spacing inside link parentheses                   |
| Newlines around the parentheses in links/images | --                                                                                                | --                                                                                                   | [markdown-preferences/link-paren-newline]<br>enforce linebreaks after opening and before closing link parentheses |
| Link destination style                          | --                                                                                                | --                                                                                                   | [markdown-preferences/link-destination-style]<br>enforce a consistent style for link destinations                 |
| Link title style                                | --                                                                                                | --                                                                                                   | [markdown-preferences/link-title-style]<br>enforce a consistent style for link titles                             |

## Rules Related to Link Definitions and Footnote Definitions

| Description                                      | [markdownlint] Rules                                                                                | [@eslint/markdown] Rules                                              | `eslint-plugin-markdown-preferences` Rules                                                                                           |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Disallow unused link/image definitions           | [MD053] _link-image-reference-definitions_<br>Link and image reference definitions should be needed | [markdown/no-unused-definitions]<br>Disallow unused definitions       | --                                                                                                                                   |
| Enforce using link reference definitions         | [MD054] _link-image-style_<br>Link and image style                                                  | --                                                                    | [markdown-preferences/prefer-link-reference-definitions]<br>enforce using link reference definitions instead of inline links         |
| Disallow unused footnote definitions             | --                                                                                                  | [markdown/no-unused-definitions]<br>Disallow unused definitions       | --                                                                                                                                   |
| Disallow duplicate definitions                   | --                                                                                                  | [markdown/no-duplicate-definitions]<br>Disallow duplicate definitions | --                                                                                                                                   |
| Disallow empty definitions                       | --                                                                                                  | [markdown/no-empty-definitions]<br>Disallow empty definitions         | --                                                                                                                                   |
| Require link/footnote definitions at end         | --                                                                                                  | --                                                                    | [markdown-preferences/definitions-last]<br>require link definitions and footnote definitions to be placed at the end of the document |
| Enforce order of link/footnote definitions       | --                                                                                                  | --                                                                    | [markdown-preferences/sort-definitions]<br>enforce a specific order for link definitions and footnote definitions                    |
| Spaces around the brackets in link definitions   | --                                                                                                  | --                                                                    | [markdown-preferences/link-bracket-spacing]<br>enforce consistent spacing inside link brackets                                       |
| Newlines around the brackets in link definitions | --                                                                                                  | --                                                                    | [markdown-preferences/link-bracket-newline]<br>enforce linebreaks after opening and before closing link brackets                     |

## Rules Related to Code & Fences

| Description                                   | [markdownlint] Rules                                                                       | [@eslint/markdown] Rules                                                    | `eslint-plugin-markdown-preferences` Rules                                                                                           |
| --------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Disallow `$` signs in shell code              | [MD014] _commands-show-output_<br>Dollar signs used before commands without showing output | --                                                                          | --                                                                                                                                   |
| Require empty lines around fenced code blocks | [MD031] _blanks-around-fences_<br>Fenced code blocks should be surrounded by blank lines   | --                                                                          | [markdown-preferences/padding-line-between-blocks]<br>require or disallow padding lines between block elements                       |
| Spaces around the text in inline codes        | [MD038] _no-space-in-code_<br>Spaces inside code span elements                             | --                                                                          | --                                                                                                                                   |
| Fenced code blocks should have a language     | [MD040] _fenced-code-language_<br>Fenced code blocks should have a language specified      | [markdown/fenced-code-language]<br>Require languages for fenced code blocks | --                                                                                                                                   |
| Fenced code block style                       | [MD046] _code-block-style_<br>Code block style                                             | --                                                                          | [markdown-preferences/prefer-fenced-code-blocks]<br>enforce the use of fenced code blocks over indented code blocks                  |
| Code fence style                              | [MD048] _code-fence-style_<br>Code fence style                                             | --                                                                          | [markdown-preferences/code-fence-style]<br>enforce a consistent code fence style (backtick or tilde) in Markdown fenced code blocks. |
| Canonical code block language names           | --                                                                                         | --                                                                          | [markdown-preferences/canonical-code-block-language]<br>enforce canonical language names in code blocks                              |
| Code fence length                             | --                                                                                         | --                                                                          | [markdown-preferences/code-fence-length]<br>enforce consistent length for code fences in Markdown fenced code blocks                 |
| Enforce specific words to be inline codes     | --                                                                                         | --                                                                          | [markdown-preferences/prefer-inline-code-words]<br>enforce the use of inline code for specific words                                 |

## Rules Related to Blockquotes

| Description                                      | [markdownlint] Rules                                                              | [@eslint/markdown] Rules | `eslint-plugin-markdown-preferences` Rules                                                               |
| ------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------- |
| Disallow multiple spaces after blockquote symbol | [MD027] _no-multiple-space-blockquote_<br>Multiple spaces after blockquote symbol | --                       | [markdown-preferences/indent]<br>enforce consistent indentation in Markdown files                        |
| Require empty lines around blockquotes           | [MD028] _no-blanks-blockquote_<br>Blank line inside blockquote                    | --                       | [markdown-preferences/no-laziness-blockquotes]<br>disallow laziness in blockquotes                       |
| Disallow laziness in blockquotes                 | --                                                                                | --                       | [markdown-preferences/no-laziness-blockquotes]<br>disallow laziness in blockquotes                       |
| Blockquote marker alignment                      | --                                                                                | --                       | [markdown-preferences/blockquote-marker-alignment]<br>enforce consistent alignment of blockquote markers |

## Rules Related to Tables

| Description                       | [markdownlint] Rules                                                         | [@eslint/markdown] Rules                                                                                  | `eslint-plugin-markdown-preferences` Rules                                                                            |
| --------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Table pipe style                  | [MD055] _table-pipe-style_<br>Table pipe style                               | --                                                                                                        | [markdown-preferences/table-leading-trailing-pipes]<br>enforce consistent use of leading and trailing pipes in tables |
| Table column count                | [MD056] _table-column-count_<br>Table column count                           | [markdown/table-column-count]<br>Disallow data rows in a table from having more cells than the header row | --                                                                                                                    |
| Require empty lines around tables | [MD058] _blanks-around-tables_<br>Tables should be surrounded by blank lines | --                                                                                                        | [markdown-preferences/padding-line-between-blocks]<br>require or disallow padding lines between block elements        |
| Table header casing               | --                                                                           | --                                                                                                        | [markdown-preferences/table-header-casing]<br>enforce consistent casing in table header cells                         |
| Table pipe alignment              | --                                                                           | --                                                                                                        | [markdown-preferences/table-pipe-alignment]<br>enforce consistent alignment of table pipes                            |
| Table pipe spacing                | --                                                                           | --                                                                                                        | [markdown-preferences/table-pipe-spacing]<br>enforce consistent spacing around table pipes                            |

## Rules Related to Emphasis and Strong Emphasis

| Description                        | [markdownlint] Rules                                             | [@eslint/markdown] Rules                                                   | `eslint-plugin-markdown-preferences` Rules                                                                                |
| ---------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Spaces around the text in emphasis | [MD037] _no-space-in-emphasis_<br>Spaces inside emphasis markers | [markdown/no-space-in-emphasis]<br>Disallow spaces around emphasis markers | --                                                                                                                        |
| Emphasis notation style            | [MD049] _emphasis-style_<br>Emphasis style                       | --                                                                         | [markdown-preferences/emphasis-delimiters-style]<br>enforce a consistent delimiter style for emphasis and strong emphasis |
| Strong emphasis notation style     | [MD050] _strong-style_<br>Strong style                           | --                                                                         | [markdown-preferences/emphasis-delimiters-style]<br>enforce a consistent delimiter style for emphasis and strong emphasis |
| Strikethrough notation style       | --                                                               | --                                                                         | [markdown-preferences/strikethrough-delimiters-style]<br>enforce a consistent delimiter style for strikethrough           |

## Rules Related to Thematic Breaks

| Description             | [markdownlint] Rules                        | [@eslint/markdown] Rules | `eslint-plugin-markdown-preferences` Rules                                                                                                       |
| ----------------------- | ------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `<hr>` notation style   | [MD035] _hr-style_<br>Horizontal rule style | --                       | [markdown-preferences/thematic-break-character-style]<br>enforce a consistent character style for thematic breaks (horizontal rules) in Markdown |
| `<hr>` length           | --                                          | --                       | [markdown-preferences/thematic-break-length]<br>enforce consistent length for thematic breaks (horizontal rules) in Markdown                     |
| `<hr>` sequence pattern | --                                          | --                       | [markdown-preferences/thematic-break-sequence-pattern]<br>enforce consistent sequence pattern for thematic breaks (horizontal rules) in Markdown |

## Rules Related to HTML

| Description          | [markdownlint] Rules                    | [@eslint/markdown] Rules                 | `eslint-plugin-markdown-preferences` Rules |
| -------------------- | --------------------------------------- | ---------------------------------------- | ------------------------------------------ |
| Disallow inline HTML | [MD033] _no-inline-html_<br>Inline HTML | [markdown/no-html]<br>Disallow HTML tags | --                                         |

## Rules Related to Emoji

| Description          | [markdownlint] Rules | [@eslint/markdown] Rules | `eslint-plugin-markdown-preferences` Rules                                                         |
| -------------------- | -------------------- | ------------------------ | -------------------------------------------------------------------------------------------------- |
| Emoji notation style | --                   | --                       | [markdown-preferences/emoji-notation]<br>enforce consistent emoji notation style in Markdown files |

## Rules Related to Whitespaces

| Description                                      | [markdownlint] Rules                                                                  | [@eslint/markdown] Rules | `eslint-plugin-markdown-preferences` Rules                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Disallow trailing spaces                         | [MD009] _no-trailing-spaces_<br>Trailing spaces                                       | --                       | [markdown-preferences/no-trailing-spaces]<br>disallow trailing whitespace at the end of lines in Markdown files |
| Disallow hard tabs                               | [MD010] _no-hard-tabs_<br>Hard tabs                                                   | --                       | --                                                                                                              |
| Disallow multiple empty lines                    | [MD012] _no-multiple-blanks_<br>Multiple consecutive blank lines                      | --                       | [markdown-preferences/no-multiple-empty-lines]<br>disallow multiple empty lines in Markdown files               |
| Require linebreak at the end of files            | [MD047] _single-trailing-newline_<br>Files should end with a single newline character | --                       | --                                                                                                              |
| Indentation                                      | --                                                                                    | --                       | [markdown-preferences/indent]<br>enforce consistent indentation in Markdown files                               |
| Disallow multiple spaces                         | --                                                                                    | --                       | [markdown-preferences/no-multi-spaces]<br>disallow multiple spaces                                              |
| Disallow trailing backslash linebreak            | --                                                                                    | --                       | [markdown-preferences/no-text-backslash-linebreak]<br>disallow text backslash at the end of a line              |
| Enforce hard linebreak style                     | --                                                                                    | --                       | [markdown-preferences/hard-linebreak-style]<br>enforce consistent hard linebreak style                          |
| Require or disallow padding lines between blocks | --                                                                                    | --                       | [markdown-preferences/padding-line-between-blocks]<br>require or disallow padding lines between block elements  |

## Rules Related to Documents

| Description                   | [markdownlint] Rules                                                          | [@eslint/markdown] Rules | `eslint-plugin-markdown-preferences` Rules |
| ----------------------------- | ----------------------------------------------------------------------------- | ------------------------ | ------------------------------------------ |
| Enforce a maximum line length | [MD013] _line-length_<br>Line length                                          | --                       | --                                         |
| Proper names                  | [MD044] _proper-names_<br>Proper names should have the correct capitalization | --                       | --                                         |

## Rules Related to Syntax

| Description                            | [markdownlint] Rules                                | [@eslint/markdown] Rules                                                       | `eslint-plugin-markdown-preferences` Rules |
| -------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------ |
| Disallow reversed link/image syntax    | [MD011] _no-reversed-links_<br>Reversed link syntax | [markdown/no-reversed-media-syntax]<br>Disallow reversed link and image syntax | --                                         |
| Disallow invalid link label references | --                                                  | [markdown/no-invalid-label-refs]<br>Disallow invalid label references          | --                                         |

[@eslint/markdown]: https://github.com/eslint/markdown
[MD001]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md001.md
[MD003]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md003.md
[MD004]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md004.md
[MD005]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md005.md
[MD007]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md007.md
[MD009]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md009.md
[MD010]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md010.md
[MD011]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md011.md
[MD012]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md012.md
[MD013]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md013.md
[MD014]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md014.md
[MD018]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md018.md
[MD019]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md019.md
[MD020]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md020.md
[MD021]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md021.md
[MD022]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md022.md
[MD023]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md023.md
[MD024]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md024.md
[MD025]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md025.md
[MD026]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md026.md
[MD027]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md027.md
[MD028]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md028.md
[MD029]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md029.md
[MD030]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md030.md
[MD031]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md031.md
[MD032]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md032.md
[MD033]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md033.md
[MD034]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md034.md
[MD035]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md035.md
[MD036]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md036.md
[MD037]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md037.md
[MD038]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md038.md
[MD039]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md039.md
[MD040]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md040.md
[MD041]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md041.md
[MD042]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md042.md
[MD043]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md043.md
[MD044]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md044.md
[MD045]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md045.md
[MD046]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md046.md
[MD047]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md047.md
[MD048]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md048.md
[MD049]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md049.md
[MD050]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md050.md
[MD051]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md051.md
[MD052]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md052.md
[MD053]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md053.md
[MD054]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md054.md
[MD055]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md055.md
[MD056]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md056.md
[MD058]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md058.md
[MD059]: https://github.com/DavidAnson/markdownlint/blob/v0.38.0/doc/md059.md
[markdown-preferences/atx-heading-closing-sequence-length]: ../rules/atx-heading-closing-sequence-length.md
[markdown-preferences/atx-heading-closing-sequence]: ../rules/atx-heading-closing-sequence.md
[markdown-preferences/blockquote-marker-alignment]: ../rules/blockquote-marker-alignment.md
[markdown-preferences/bullet-list-marker-style]: ../rules/bullet-list-marker-style.md
[markdown-preferences/canonical-code-block-language]: ../rules/canonical-code-block-language.md
[markdown-preferences/code-fence-length]: ../../docs/rules/code-fence-length.md
[markdown-preferences/code-fence-style]: ./../rules/code-fence-style.md
[markdown-preferences/definitions-last]: ../rules/definitions-last.md
[markdown-preferences/emoji-notation]: ../rules/emoji-notation.md
[markdown-preferences/emphasis-delimiters-style]: ./../rules/emphasis-delimiters-style.md
[markdown-preferences/hard-linebreak-style]: ../rules/hard-linebreak-style.md
[markdown-preferences/heading-casing]: ../rules/heading-casing.md
[markdown-preferences/indent]: ./../rules/indent.md
[markdown-preferences/level1-heading-style]: ./../rules/level1-heading-style.md
[markdown-preferences/level2-heading-style]: ./../rules/level2-heading-style.md
[markdown-preferences/link-bracket-newline]: ./../rules/link-bracket-newline.md
[markdown-preferences/link-bracket-spacing]: ./../rules/link-bracket-spacing.md
[markdown-preferences/link-destination-style]: ./../rules/link-destination-style.md
[markdown-preferences/link-paren-newline]: ./../rules/link-paren-newline.md
[markdown-preferences/link-paren-spacing]: ./../rules/link-paren-spacing.md
[markdown-preferences/link-title-style]: ./../rules/link-title-style.md
[markdown-preferences/list-marker-alignment]: ../rules/list-marker-alignment.md
[markdown-preferences/no-laziness-blockquotes]: ../rules/no-laziness-blockquotes.md
[markdown-preferences/no-multi-spaces]: ./../rules/no-multi-spaces.md
[markdown-preferences/no-multiple-empty-lines]: ../rules/no-multiple-empty-lines.md
[markdown-preferences/no-text-backslash-linebreak]: ../rules/no-text-backslash-linebreak.md
[markdown-preferences/no-trailing-spaces]: ../rules/no-trailing-spaces.md
[markdown-preferences/ordered-list-marker-sequence]: ../rules/ordered-list-marker-sequence.md
[markdown-preferences/ordered-list-marker-start]: ../rules/ordered-list-marker-start.md
[markdown-preferences/ordered-list-marker-style]: ../rules/ordered-list-marker-style.md
[markdown-preferences/padding-line-between-blocks]: ../rules/padding-line-between-blocks.md
[markdown-preferences/prefer-autolinks]: ../rules/prefer-autolinks.md
[markdown-preferences/prefer-fenced-code-blocks]: ../rules/prefer-fenced-code-blocks.md
[markdown-preferences/prefer-inline-code-words]: ../rules/prefer-inline-code-words.md
[markdown-preferences/prefer-link-reference-definitions]: ../rules/prefer-link-reference-definitions.md
[markdown-preferences/prefer-linked-words]: ../rules/prefer-linked-words.md
[markdown-preferences/setext-heading-underline-length]: ./../rules/setext-heading-underline-length.md
[markdown-preferences/sort-definitions]: ../rules/sort-definitions.md
[markdown-preferences/strikethrough-delimiters-style]: ./../rules/strikethrough-delimiters-style.md
[markdown-preferences/table-header-casing]: ../rules/table-header-casing.md
[markdown-preferences/table-leading-trailing-pipes]: ./../rules/table-leading-trailing-pipes.md
[markdown-preferences/table-pipe-alignment]: ./../rules/table-pipe-alignment.md
[markdown-preferences/table-pipe-spacing]: ./../rules/table-pipe-spacing.md
[markdown-preferences/thematic-break-character-style]: ./../rules/thematic-break-character-style.md
[markdown-preferences/thematic-break-length]: ./../rules/thematic-break-length.md
[markdown-preferences/thematic-break-sequence-pattern]: ./../rules/thematic-break-sequence-pattern.md
[markdown/fenced-code-language]: https://github.com/eslint/markdown/blob/v7.2.0/docs/rules/fenced-code-language.md
[markdown/heading-increment]: https://github.com/eslint/markdown/blob/v7.2.0/docs/rules/heading-increment.md
[markdown/no-bare-urls]: https://github.com/eslint/markdown/blob/v7.2.0/docs/rules/no-bare-urls.md
[markdown/no-duplicate-definitions]: https://github.com/eslint/markdown/blob/v7.2.0/docs/rules/no-duplicate-definitions.md
[markdown/no-duplicate-headings]: https://github.com/eslint/markdown/blob/v7.2.0/docs/rules/no-duplicate-headings.md
[markdown/no-empty-definitions]: https://github.com/eslint/markdown/blob/v7.2.0/docs/rules/no-empty-definitions.md
[markdown/no-empty-images]: https://github.com/eslint/markdown/blob/v7.2.0/docs/rules/no-empty-images.md
[markdown/no-empty-links]: https://github.com/eslint/markdown/blob/v7.2.0/docs/rules/no-empty-links.md
[markdown/no-html]: https://github.com/eslint/markdown/blob/v7.2.0/docs/rules/no-html.md
[markdown/no-invalid-label-refs]: https://github.com/eslint/markdown/blob/v7.2.0/docs/rules/no-invalid-label-refs.md
[markdown/no-missing-atx-heading-space]: https://github.com/eslint/markdown/blob/v7.2.0/docs/rules/no-missing-atx-heading-space.md
[markdown/no-missing-label-refs]: https://github.com/eslint/markdown/blob/v7.2.0/docs/rules/no-missing-label-refs.md
[markdown/no-missing-link-fragments]: https://github.com/eslint/markdown/blob/v7.2.0/docs/rules/no-missing-link-fragments.md
[markdown/no-multiple-h1]: https://github.com/eslint/markdown/blob/v7.2.0/docs/rules/no-multiple-h1.md
[markdown/no-reversed-media-syntax]: https://github.com/eslint/markdown/blob/v7.2.0/docs/rules/no-reversed-media-syntax.md
[markdown/no-space-in-emphasis]: https://github.com/eslint/markdown/blob/v7.2.0/docs/rules/no-space-in-emphasis.md
[markdown/no-unused-definitions]: https://github.com/eslint/markdown/blob/v7.2.0/docs/rules/no-unused-definitions.md
[markdown/require-alt-text]: https://github.com/eslint/markdown/blob/v7.2.0/docs/rules/require-alt-text.md
[markdown/table-column-count]: https://github.com/eslint/markdown/blob/v7.2.0/docs/rules/table-column-count.md
[markdownlint]: https://github.com/DavidAnson/markdownlint
