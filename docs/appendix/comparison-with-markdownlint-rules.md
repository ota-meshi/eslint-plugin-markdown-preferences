# Comparison With markdownlint Rules

<!-- eslint markdown-preferences/prefer-link-reference-definitions: ["error", { "minLinks": 1 }] -->

`eslint-plugin-markdown-preferences` does not aim for compatibility with [markdownlint], but comparing rules is useful to check the strengths of each.\
Also, by combining [markdownlint] and using each rule, you may be able to achieve the optimal Markdown style for you.\
`eslint-plugin-markdown-preferences` is designed to provide useful features when used together with [@eslint/markdown], so rules from [@eslint/markdown] are also compared.

Please note that each OSS is constantly evolving, so this list is not exhaustive.

[@eslint/markdown]: https://github.com/eslint/markdown
[markdownlint]: https://github.com/DavidAnson/markdownlint

## Rules Related to Headings

| Description                                             | [markdownlint]'s Rule                                                                                   | [@eslint/markdown]'s Rule                                                                              | `eslint-plugin-markdown-preferences`'s Rule                                                                                                          |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading levels should only increment by one             | **[MD001]** _heading-increment_<br>Heading levels should only increment by one level at a time          | **[markdown/heading-increment]**<br>Enforce heading levels increment by one                            | --                                                                                                                                                   |
| Heading notation style                                  | **[MD003]** _heading-style_<br>Heading style                                                            | --                                                                                                     | --                                                                                                                                                   |
| ATX heading closing `#` presence                        | **[MD003]** _heading-style_<br>Heading style                                                            | --                                                                                                     | **[markdown-preferences/atx-headings-closing-sequence]**<br>enforce consistent use of closing sequence in ATX headings.                              |
| ATX heading closing `#` length                          |                                                                                                         |                                                                                                        | **[markdown-preferences/atx-headings-closing-sequence-length]**<br>enforce consistent length for the closing sequence (trailing #s) in ATX headings. |
| Require space after ATX heading `#`                     | **[MD018]** _no-missing-space-atx_<br>No space after hash on atx style heading                          | [markdown/no-missing-atx-heading-space]<br>Disallow headings without a space after the hash characters | --                                                                                                                                                   |
| Disallow multiple spaces after ATX heading `#`          | **[MD019]** _no-multiple-space-atx_<br>Multiple spaces after hash on atx style heading                  | --                                                                                                     | --                                                                                                                                                   |
| Require space before closing ATX heading `#`            | **[MD020]** _no-missing-space-closed-atx_<br>No space inside hashes on closed atx style heading         | --                                                                                                     | --                                                                                                                                                   |
| Disallow multiple spaces before closing ATX heading `#` | **[MD021]** _no-multiple-space-closed-atx_<br>Multiple spaces inside hashes on closed atx style heading | --                                                                                                     | --                                                                                                                                                   |
| Require empty lines around headings                     | **[MD022]** _blanks-around-headings_<br>Headings should be surrounded by blank lines                    | --                                                                                                     | --                                                                                                                                                   |
| Heading indentation                                     | **[MD023]** _heading-start-left_<br>Headings must start at the beginning of the line                    | --                                                                                                     | --                                                                                                                                                   |
| Disallow duplicate headings                             | **[MD024]** _no-duplicate-heading_<br>Multiple headings with the same content                           | [markdown/no-duplicate-headings]<br>Disallow duplicate headings in the same document                   | --                                                                                                                                                   |
| Limit to one `<h1>` heading                             | **[MD025]** _single-title/single-h1_<br>Multiple top-level headings in the same document                | [markdown/no-multiple-h1]<br>Disallow multiple H1 headings in the same document                        | --                                                                                                                                                   |
| Disallow trailing punctuation in headings               | **[MD026]** _no-trailing-punctuation_<br>Trailing punctuation in heading                                | --                                                                                                     | --                                                                                                                                                   |
| Require emphasis-like headings to be real headings      | **[MD036]** _no-emphasis-as-heading_<br>Emphasis used instead of a heading                              | --                                                                                                     | --                                                                                                                                                   |
| Require heading at the start of document                | **[MD041]** _first-line-heading/first-line-h1_<br>First line in a file should be a top-level heading    | --                                                                                                     | --                                                                                                                                                   |
| Enforce preferred heading structure                     | **[MD043]** _required-headings_<br>Required heading structure                                           | --                                                                                                     | --                                                                                                                                                   |
| Headings casing                                         | --                                                                                                      | --                                                                                                     | **[markdown-preferences/heading-casing]**<br>enforce consistent casing in headings                                                                   |

## Rules Related to Lists

| Description                         | [markdownlint]'s Rule                                                                  | [@eslint/markdown]'s Rule | `eslint-plugin-markdown-preferences`'s Rule                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `<ul>` notation style               | **[MD004]** _ul-style_<br>Unordered list style                                         | --                        | --                                                                                                              |
| List indentation                    | **[MD005]** _list-indent_<br>Inconsistent indentation for list items at the same level | --                        | --                                                                                                              |
| `<ul>` indentation                  | **[MD007]** _ul-indent_<br>Unordered list indentation                                  | --                        | --                                                                                                              |
| Enforce `<ol>` marker sequence      | **[MD029]** _ol-prefix_<br>Ordered list item prefix                                    | --                        | [markdown-preferences/ordered-list-marker-sequence]<br>enforce that ordered list markers use sequential numbers |
| Enforce `<ol>` marker start         | **[MD029]** _ol-prefix_<br>Ordered list item prefix                                    | --                        | [markdown-preferences/ordered-list-marker-start]<br>enforce that ordered list markers start with 1 or 0         |
| Consistent spaces after list marker | **[MD030]** _list-marker-space_<br>Spaces after list markers                           | --                        | --                                                                                                              |
| Require empty lines around lists    | **[MD032]** _blanks-around-lists_<br>Lists should be surrounded by blank lines         | --                        | --                                                                                                              |

## Rules Related to Links and Images

| Description                                   | [markdownlint]'s Rule                                                                                 | [@eslint/markdown]'s Rule                                                                            | `eslint-plugin-markdown-preferences`'s Rule                                               |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Disallow bare URLs                            | **[MD034]** _no-bare-urls_<br>Bare URL used                                                           | **[markdown/no-bare-urls]**<br>Disallow bare URLs                                                    | **[markdown-preferences/prefer-autolinks]**<br>enforce the use of autolinks for URLs      |
| Spaces around the text in links               | **[MD039]** _no-space-in-links_<br>Spaces inside link text                                            | --                                                                                                   | --                                                                                        |
| Disallow empty links                          | **[MD042]** _no-empty-links_<br>No empty links                                                        | **[markdown/no-empty-links]**<br>Disallow empty links                                                | --                                                                                        |
| Disallow empty images                         | --                                                                                                    | **[markdown/no-empty-images]**<br>Disallow empty images                                              | --                                                                                        |
| Enforce alt text for images                   | **[MD045]** _no-alt-text_<br>Images should have alternate text (alt text)                             | **[markdown/require-alt-text]**<br>Require alternative text for images                               | --                                                                                        |
| Disallow missing reference for link fragments | **[MD051]** _link-fragments_<br>Link fragments should be valid                                        | [markdown/no-missing-link-fragments]<br>Disallow link fragments that do not reference valid headings | --                                                                                        |
| Disallow missing reference for links/images   | **[MD052]** _reference-links-images_<br>Reference links and images should use a label that is defined | **[markdown/no-missing-label-refs]**<br>Disallow missing label references                            | --                                                                                        |
| Link and image notation style                 | **[MD054]** _link-image-style_<br>Link and image style                                                | --                                                                                                   | --                                                                                        |
| Require descriptive link text                 | **[MD059]** _descriptive-link-text_<br>Link text should be descriptive                                | --                                                                                                   | --                                                                                        |
| Enforce specific words to be links            | --                                                                                                    | --                                                                                                   | **[markdown-preferences/prefer-linked-words]**<br>enforce the specified word to be a link |

## Rules Related to Link Definitions and Footnote Definitions

| Description                                | [markdownlint]'s Rule                                                                                   | [@eslint/markdown]'s Rule                                                 | `eslint-plugin-markdown-preferences`'s Rule                                                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Disallow unused link/image definitions     | **[MD053]** _link-image-reference-definitions_<br>Link and image reference definitions should be needed | **[markdown/no-unused-definitions]**<br>Disallow unused definitions       | --                                                                                                                                       |
| Enforce using link reference definitions   | **[MD054]** _link-image-style_<br>Link and image style                                                  | --                                                                        | **[markdown-preferences/prefer-link-reference-definitions]**<br>enforce using link reference definitions instead of inline links         |
| Disallow unused footnote definitions       | --                                                                                                      | **[markdown/no-unused-definitions]**<br>Disallow unused definitions       | --                                                                                                                                       |
| Disallow duplicate definitions             | --                                                                                                      | **[markdown/no-duplicate-definitions]**<br>Disallow duplicate definitions | --                                                                                                                                       |
| Disallow empty definitions                 | --                                                                                                      | **[markdown/no-empty-definitions]**<br>Disallow empty definitions         | --                                                                                                                                       |
| Require link/footnote definitions at end   | --                                                                                                      | --                                                                        | **[markdown-preferences/definitions-last]**<br>require link definitions and footnote definitions to be placed at the end of the document |
| Enforce order of link/footnote definitions | --                                                                                                      | --                                                                        | **[markdown-preferences/sort-definitions]**<br>enforce a specific order for link definitions and footnote definitions                    |

## Rules Related to Code & Fences

| Description                                   | [markdownlint]'s Rule                                                                          | [@eslint/markdown]'s Rule                                                       | `eslint-plugin-markdown-preferences`'s Rule                                                                             |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Disallow `$` signs in shell code              | **[MD014]** _commands-show-output_<br>Dollar signs used before commands without showing output | --                                                                              | --                                                                                                                      |
| Require empty lines around fenced code blocks | **[MD031]** _blanks-around-fences_<br>Fenced code blocks should be surrounded by blank lines   | --                                                                              | --                                                                                                                      |
| Spaces around the text in inline codes        | **[MD038]** _no-space-in-code_<br>Spaces inside code span elements                             | --                                                                              | --                                                                                                                      |
| Fenced code blocks should have a language     | **[MD040]** _fenced-code-language_<br>Fenced code blocks should have a language specified      | **[markdown/fenced-code-language]**<br>Require languages for fenced code blocks | --                                                                                                                      |
| Fenced code block style                       | **[MD046]** _code-block-style_<br>Code block style                                             | --                                                                              | **[markdown-preferences/prefer-fenced-code-blocks]**<br>enforce the use of fenced code blocks over indented code blocks |
| Code fence style                              | **[MD048]** _code-fence-style_<br>Code fence style                                             | --                                                                              | --                                                                                                                      |
| Canonical code block language names           | --                                                                                             | --                                                                              | **[markdown-preferences/canonical-code-block-language]**<br>enforce canonical language names in code blocks             |
| Enforce specific words to be inline codes     | --                                                                                             | --                                                                              | **[markdown-preferences/prefer-inline-code-words]**<br>enforce the use of inline code for specific words                |

## Rules Related to Blockquotes

| Description                                      | [markdownlint]'s Rule                                                                 | [@eslint/markdown]'s Rule | `eslint-plugin-markdown-preferences`'s Rule                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------- |
| Disallow multiple spaces after blockquote symbol | **[MD027]** _no-multiple-space-blockquote_<br>Multiple spaces after blockquote symbol | --                        | --                                                                                     |
| Require empty lines around blockquotes           | **[MD028]** _no-blanks-blockquote_<br>Blank line inside blockquote                    | --                        | --                                                                                     |
| Disallow laziness in blockquotes                 | --                                                                                    | --                        | **[markdown-preferences/no-laziness-blockquotes]**<br>disallow laziness in blockquotes |

## Rules Related to Tables

| Description                       | [markdownlint]'s Rule                                                            | [@eslint/markdown]'s Rule                                                                                     | `eslint-plugin-markdown-preferences`'s Rule |
| --------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Table pipe style                  | **[MD055]** _table-pipe-style_<br>Table pipe style                               | --                                                                                                            | --                                          |
| Table column count                | **[MD056]** _table-column-count_<br>Table column count                           | **[markdown/table-column-count]**<br>Disallow data rows in a table from having more cells than the header row | --                                          |
| Require empty lines around tables | **[MD058]** _blanks-around-tables_<br>Tables should be surrounded by blank lines | --                                                                                                            | --                                          |

## Rules Related to Emphasis and Strong Emphasis

| Description                        | [markdownlint]'s Rule                                                | [@eslint/markdown]'s Rule | `eslint-plugin-markdown-preferences`'s Rule |
| ---------------------------------- | -------------------------------------------------------------------- | ------------------------- | ------------------------------------------- |
| Spaces around the text in emphasis | **[MD037]** _no-space-in-emphasis_<br>Spaces inside emphasis markers | --                        | --                                          |
| Emphasis notation style            | **[MD049]** _emphasis-style_<br>Emphasis style                       | --                        | --                                          |
| Strong emphasis notation style     | **[MD050]** _strong-style_<br>Strong style                           | --                        | --                                          |

## Rules Related to Thematic Breaks

| Description           | [markdownlint]'s Rule                           | [@eslint/markdown]'s Rule | `eslint-plugin-markdown-preferences`'s Rule |
| --------------------- | ----------------------------------------------- | ------------------------- | ------------------------------------------- |
| `<hr>` notation style | **[MD035]** _hr-style_<br>Horizontal rule style | --                        | --                                          |

## Rules Related to HTML

| Description          | [markdownlint]'s Rule                       | [@eslint/markdown]'s Rule                    | `eslint-plugin-markdown-preferences`'s Rule |
| -------------------- | ------------------------------------------- | -------------------------------------------- | ------------------------------------------- |
| Disallow inline HTML | **[MD033]** _no-inline-html_<br>Inline HTML | **[markdown/no-html]**<br>Disallow HTML tags | --                                          |

## Rules Related to Emoji

| Description          | [markdownlint]'s Rule | [@eslint/markdown]'s Rule | `eslint-plugin-markdown-preferences`'s Rule                                                            |
| -------------------- | --------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------ |
| Emoji notation style | --                    | --                        | **[markdown-preferences/emoji-notation]**<br>enforce consistent emoji notation style in Markdown files |

## Rules Related to Whitespaces

| Description                           | [markdownlint]'s Rule                                                                     | [@eslint/markdown]'s Rule | `eslint-plugin-markdown-preferences`'s Rule                                                                         |
| ------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Disallow trailing spaces              | **[MD009]** _no-trailing-spaces_<br>Trailing spaces                                       | --                        | **[markdown-preferences/no-trailing-spaces]**<br>disallow trailing whitespace at the end of lines in Markdown files |
| Disallow hard tabs                    | **[MD010]** _no-hard-tabs_<br>Hard tabs                                                   | --                        | --                                                                                                                  |
| Disallow multiple empty lines         | **[MD012]** _no-multiple-blanks_<br>Multiple consecutive blank lines                      | --                        | **[markdown-preferences/no-multiple-empty-lines]**<br>disallow multiple empty lines in Markdown files               |
| Require linebreak at the end of files | **[MD047]** _single-trailing-newline_<br>Files should end with a single newline character | --                        | --                                                                                                                  |
| Disallow trailing backslash linebreak | --                                                                                        | --                        | **[markdown-preferences/no-text-backslash-linebreak]**<br>disallow text backslash at the end of a line              |
| Enforce hard linebreak style          | --                                                                                        | --                        | **[markdown-preferences/hard-linebreak-style]**<br>enforce consistent hard linebreak style                          |

## Rules Related to Documents

| Description                   | [markdownlint]'s Rule                                                             | [@eslint/markdown]'s Rule | `eslint-plugin-markdown-preferences`'s Rule |
| ----------------------------- | --------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------- |
| Enforce a maximum line length | **[MD013]** _line-length_<br>Line length                                          | --                        | --                                          |
| Proper names                  | **[MD044]** _proper-names_<br>Proper names should have the correct capitalization | --                        | --                                          |

## Rules Related to Syntax

| Description                            | [markdownlint]'s Rule                                   | [@eslint/markdown]'s Rule                                                          | `eslint-plugin-markdown-preferences`'s Rule |
| -------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------- |
| Disallow reversed link/image syntax    | **[MD011]** _no-reversed-links_<br>Reversed link syntax | **[markdown/no-reversed-media-syntax]**<br>Disallow reversed link and image syntax | --                                          |
| Disallow invalid link label references | --                                                      | **[markdown/no-invalid-label-refs]**<br>Disallow invalid label references          | --                                          |

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
[markdown/fenced-code-language]: https://github.com/eslint/markdown/blob/v7.1.0/docs/rules/fenced-code-language.md
[markdown/heading-increment]: https://github.com/eslint/markdown/blob/v7.1.0/docs/rules/heading-increment.md
[markdown/no-bare-urls]: https://github.com/eslint/markdown/blob/v7.1.0/docs/rules/no-bare-urls.md
[markdown/no-duplicate-definitions]: https://github.com/eslint/markdown/blob/v7.1.0/docs/rules/no-duplicate-definitions.md
[markdown/no-duplicate-headings]: https://github.com/eslint/markdown/blob/v7.1.0/docs/rules/no-duplicate-headings.md
[markdown/no-empty-definitions]: https://github.com/eslint/markdown/blob/v7.1.0/docs/rules/no-empty-definitions.md
[markdown/no-empty-images]: https://github.com/eslint/markdown/blob/v7.1.0/docs/rules/no-empty-images.md
[markdown/no-empty-links]: https://github.com/eslint/markdown/blob/v7.1.0/docs/rules/no-empty-links.md
[markdown/no-html]: https://github.com/eslint/markdown/blob/v7.1.0/docs/rules/no-html.md
[markdown/no-invalid-label-refs]: https://github.com/eslint/markdown/blob/v7.1.0/docs/rules/no-invalid-label-refs.md
[markdown/no-missing-atx-heading-space]: https://github.com/eslint/markdown/blob/v7.1.0/docs/rules/no-missing-atx-heading-space.md
[markdown/no-missing-label-refs]: https://github.com/eslint/markdown/blob/v7.1.0/docs/rules/no-missing-label-refs.md
[markdown/no-missing-link-fragments]: https://github.com/eslint/markdown/blob/v7.1.0/docs/rules/no-missing-link-fragments.md
[markdown/no-multiple-h1]: https://github.com/eslint/markdown/blob/v7.1.0/docs/rules/no-multiple-h1.md
[markdown/no-reversed-media-syntax]: https://github.com/eslint/markdown/blob/v7.1.0/docs/rules/no-reversed-media-syntax.md
[markdown/no-unused-definitions]: https://github.com/eslint/markdown/blob/v7.1.0/docs/rules/no-unused-definitions.md
[markdown/require-alt-text]: https://github.com/eslint/markdown/blob/v7.1.0/docs/rules/require-alt-text.md
[markdown/table-column-count]: https://github.com/eslint/markdown/blob/v7.1.0/docs/rules/table-column-count.md
[markdown-preferences/canonical-code-block-language]: ../rules/canonical-code-block-language.md
[markdown-preferences/emoji-notation]: ../rules/emoji-notation.md
[markdown-preferences/heading-casing]: ../rules/heading-casing.md
[markdown-preferences/ordered-list-marker-start]: ../rules/ordered-list-marker-start.md
[markdown-preferences/prefer-inline-code-words]: ../rules/prefer-inline-code-words.md
[markdown-preferences/prefer-linked-words]: ../rules/prefer-linked-words.md
[markdown-preferences/atx-headings-closing-sequence]: ../rules/atx-headings-closing-sequence.md
[markdown-preferences/atx-headings-closing-sequence-length]: ../rules/atx-headings-closing-sequence-length.md
[markdown-preferences/definitions-last]: ../rules/definitions-last.md
[markdown-preferences/hard-linebreak-style]: ../rules/hard-linebreak-style.md
[markdown-preferences/no-laziness-blockquotes]: ../rules/no-laziness-blockquotes.md
[markdown-preferences/no-multiple-empty-lines]: ../rules/no-multiple-empty-lines.md
[markdown-preferences/no-text-backslash-linebreak]: ../rules/no-text-backslash-linebreak.md
[markdown-preferences/no-trailing-spaces]: ../rules/no-trailing-spaces.md
[markdown-preferences/ordered-list-marker-sequence]: ../rules/ordered-list-marker-sequence.md
[markdown-preferences/prefer-autolinks]: ../rules/prefer-autolinks.md
[markdown-preferences/prefer-fenced-code-blocks]: ../rules/prefer-fenced-code-blocks.md
[markdown-preferences/prefer-link-reference-definitions]: ../rules/prefer-link-reference-definitions.md
[markdown-preferences/sort-definitions]: ../rules/sort-definitions.md
