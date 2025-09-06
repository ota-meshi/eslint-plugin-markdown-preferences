// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "npm run update"

/* eslint-disable */
/* prettier-ignore */
import type { Linter } from 'eslint'

declare module 'eslint' {
  namespace Linter {
    interface RulesRecord extends RuleOptions {}
  }
}

export interface RuleOptions {
  /**
   * enforce consistent use of closing sequence in ATX headings.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/atx-heading-closing-sequence.html
   */
  'markdown-preferences/atx-heading-closing-sequence'?: Linter.RuleEntry<MarkdownPreferencesAtxHeadingClosingSequence>
  /**
   * enforce consistent length for the closing sequence (trailing #s) in ATX headings.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/atx-heading-closing-sequence-length.html
   */
  'markdown-preferences/atx-heading-closing-sequence-length'?: Linter.RuleEntry<MarkdownPreferencesAtxHeadingClosingSequenceLength>
  /**
   * enforce consistent alignment of blockquote markers
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/blockquote-marker-alignment.html
   */
  'markdown-preferences/blockquote-marker-alignment'?: Linter.RuleEntry<[]>
  /**
   * enforce consistent bullet list (unordered list) marker style
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/bullet-list-marker-style.html
   */
  'markdown-preferences/bullet-list-marker-style'?: Linter.RuleEntry<MarkdownPreferencesBulletListMarkerStyle>
  /**
   * enforce canonical language names in code blocks
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/canonical-code-block-language.html
   */
  'markdown-preferences/canonical-code-block-language'?: Linter.RuleEntry<MarkdownPreferencesCanonicalCodeBlockLanguage>
  /**
   * enforce a consistent code fence style (backtick or tilde) in Markdown fenced code blocks.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/code-fence-style.html
   */
  'markdown-preferences/code-fence-style'?: Linter.RuleEntry<MarkdownPreferencesCodeFenceStyle>
  /**
   * require link definitions and footnote definitions to be placed at the end of the document
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/definitions-last.html
   */
  'markdown-preferences/definitions-last'?: Linter.RuleEntry<[]>
  /**
   * enforce consistent emoji notation style in Markdown files.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/emoji-notation.html
   */
  'markdown-preferences/emoji-notation'?: Linter.RuleEntry<MarkdownPreferencesEmojiNotation>
  /**
   * enforce a consistent delimiter style for emphasis and strong emphasis
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/emphasis-delimiters-style.html
   */
  'markdown-preferences/emphasis-delimiters-style'?: Linter.RuleEntry<MarkdownPreferencesEmphasisDelimitersStyle>
  /**
   * enforce consistent hard linebreak style.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/hard-linebreak-style.html
   */
  'markdown-preferences/hard-linebreak-style'?: Linter.RuleEntry<MarkdownPreferencesHardLinebreakStyle>
  /**
   * enforce consistent casing in headings.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/heading-casing.html
   */
  'markdown-preferences/heading-casing'?: Linter.RuleEntry<MarkdownPreferencesHeadingCasing>
  /**
   * enforce consistent style for level 1 headings
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/level1-heading-style.html
   */
  'markdown-preferences/level1-heading-style'?: Linter.RuleEntry<MarkdownPreferencesLevel1HeadingStyle>
  /**
   * enforce consistent style for level 2 headings
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/level2-heading-style.html
   */
  'markdown-preferences/level2-heading-style'?: Linter.RuleEntry<MarkdownPreferencesLevel2HeadingStyle>
  /**
   * enforce consistent alignment of list markers
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/list-marker-alignment.html
   */
  'markdown-preferences/list-marker-alignment'?: Linter.RuleEntry<MarkdownPreferencesListMarkerAlignment>
  /**
   * disallow laziness in blockquotes
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/no-laziness-blockquotes.html
   */
  'markdown-preferences/no-laziness-blockquotes'?: Linter.RuleEntry<[]>
  /**
   * disallow multiple empty lines in Markdown files.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/no-multiple-empty-lines.html
   */
  'markdown-preferences/no-multiple-empty-lines'?: Linter.RuleEntry<MarkdownPreferencesNoMultipleEmptyLines>
  /**
   * disallow text backslash at the end of a line.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/no-text-backslash-linebreak.html
   */
  'markdown-preferences/no-text-backslash-linebreak'?: Linter.RuleEntry<[]>
  /**
   * disallow trailing whitespace at the end of lines in Markdown files.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/no-trailing-spaces.html
   */
  'markdown-preferences/no-trailing-spaces'?: Linter.RuleEntry<MarkdownPreferencesNoTrailingSpaces>
  /**
   * enforce that ordered list markers use sequential numbers
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/ordered-list-marker-sequence.html
   */
  'markdown-preferences/ordered-list-marker-sequence'?: Linter.RuleEntry<[]>
  /**
   * enforce that ordered list markers start with 1 or 0
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/ordered-list-marker-start.html
   */
  'markdown-preferences/ordered-list-marker-start'?: Linter.RuleEntry<MarkdownPreferencesOrderedListMarkerStart>
  /**
   * enforce consistent ordered list marker style
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/ordered-list-marker-style.html
   */
  'markdown-preferences/ordered-list-marker-style'?: Linter.RuleEntry<MarkdownPreferencesOrderedListMarkerStyle>
  /**
   * require or disallow padding lines between blocks
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/padding-line-between-blocks.html
   */
  'markdown-preferences/padding-line-between-blocks'?: Linter.RuleEntry<MarkdownPreferencesPaddingLineBetweenBlocks>
  /**
   * enforce the use of autolinks for URLs
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-autolinks.html
   */
  'markdown-preferences/prefer-autolinks'?: Linter.RuleEntry<[]>
  /**
   * enforce the use of fenced code blocks over indented code blocks
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-fenced-code-blocks.html
   */
  'markdown-preferences/prefer-fenced-code-blocks'?: Linter.RuleEntry<[]>
  /**
   * enforce the use of inline code for specific words.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-inline-code-words.html
   */
  'markdown-preferences/prefer-inline-code-words'?: Linter.RuleEntry<MarkdownPreferencesPreferInlineCodeWords>
  /**
   * enforce using link reference definitions instead of inline links
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-link-reference-definitions.html
   */
  'markdown-preferences/prefer-link-reference-definitions'?: Linter.RuleEntry<MarkdownPreferencesPreferLinkReferenceDefinitions>
  /**
   * enforce the specified word to be a link.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-linked-words.html
   */
  'markdown-preferences/prefer-linked-words'?: Linter.RuleEntry<MarkdownPreferencesPreferLinkedWords>
  /**
   * enforce setext heading underline length
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/setext-heading-underline-length.html
   */
  'markdown-preferences/setext-heading-underline-length'?: Linter.RuleEntry<MarkdownPreferencesSetextHeadingUnderlineLength>
  /**
   * enforce a specific order for link definitions and footnote definitions
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/sort-definitions.html
   */
  'markdown-preferences/sort-definitions'?: Linter.RuleEntry<MarkdownPreferencesSortDefinitions>
  /**
   * enforce a consistent delimiter style for strikethrough
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/strikethrough-delimiters-style.html
   */
  'markdown-preferences/strikethrough-delimiters-style'?: Linter.RuleEntry<MarkdownPreferencesStrikethroughDelimitersStyle>
  /**
   * enforce consistent casing in table header cells.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/table-header-casing.html
   */
  'markdown-preferences/table-header-casing'?: Linter.RuleEntry<MarkdownPreferencesTableHeaderCasing>
  /**
   * enforce consistent character style for thematic breaks (horizontal rules) in Markdown.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/thematic-break-character-style.html
   */
  'markdown-preferences/thematic-break-character-style'?: Linter.RuleEntry<MarkdownPreferencesThematicBreakCharacterStyle>
  /**
   * enforce consistent length for thematic breaks (horizontal rules) in Markdown.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/thematic-break-length.html
   */
  'markdown-preferences/thematic-break-length'?: Linter.RuleEntry<MarkdownPreferencesThematicBreakLength>
  /**
   * enforce consistent repeating patterns for thematic breaks (horizontal rules) in Markdown.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/thematic-break-sequence-pattern.html
   */
  'markdown-preferences/thematic-break-sequence-pattern'?: Linter.RuleEntry<MarkdownPreferencesThematicBreakSequencePattern>
}

/* ======= Declarations ======= */
// ----- markdown-preferences/atx-heading-closing-sequence -----
type MarkdownPreferencesAtxHeadingClosingSequence = []|[{
  closingSequence?: ("always" | "never")
}]
// ----- markdown-preferences/atx-heading-closing-sequence-length -----
type MarkdownPreferencesAtxHeadingClosingSequenceLength = []|[{
  mode?: ("match-opening" | "length" | "consistent" | "consistent-line-length" | "fixed-line-length")
  length?: number
}]
// ----- markdown-preferences/bullet-list-marker-style -----
type MarkdownPreferencesBulletListMarkerStyle = []|[{
  primary?: ("-" | "*" | "+")
  secondary?: ("-" | "*" | "+" | "any")
  overrides?: {
    level?: number
    parentMarker?: ("-" | "*" | "+" | "any" | "ordered")
    primary?: ("-" | "*" | "+")
    secondary?: ("-" | "*" | "+" | "any")
  }[]
}]
// ----- markdown-preferences/canonical-code-block-language -----
type MarkdownPreferencesCanonicalCodeBlockLanguage = []|[{
  languages?: {
    [k: string]: string
  }
}]
// ----- markdown-preferences/code-fence-style -----
type MarkdownPreferencesCodeFenceStyle = []|[{
  style?: ("backtick" | "tilde")
}]
// ----- markdown-preferences/emoji-notation -----
type MarkdownPreferencesEmojiNotation = []|[{
  
  prefer?: ("unicode" | "colon")
  
  ignoreUnknown?: boolean
  
  ignoreList?: string[]
}]
// ----- markdown-preferences/emphasis-delimiters-style -----
type MarkdownPreferencesEmphasisDelimitersStyle = []|[{
  emphasis?: ("*" | "_")
  strong?: ("**" | "__")
  strongEmphasis?: (("***" | "___") | {
    outer: "*"
    inner: "__"
  } | {
    outer: "**"
    inner: "_"
  } | {
    outer: "_"
    inner: "**"
  } | {
    outer: "__"
    inner: "*"
  })
}]
// ----- markdown-preferences/hard-linebreak-style -----
type MarkdownPreferencesHardLinebreakStyle = []|[{
  style?: ("backslash" | "spaces")
}]
// ----- markdown-preferences/heading-casing -----
type MarkdownPreferencesHeadingCasing = []|[{
  style?: ("Title Case" | "Sentence case")
  
  preserveWords?: string[]
  
  ignorePatterns?: string[]
  
  minorWords?: string[]
}]
// ----- markdown-preferences/level1-heading-style -----
type MarkdownPreferencesLevel1HeadingStyle = []|[{
  style?: ("atx" | "setext")
  allowMultilineSetext?: boolean
}]
// ----- markdown-preferences/level2-heading-style -----
type MarkdownPreferencesLevel2HeadingStyle = []|[{
  style?: ("atx" | "setext")
  allowMultilineSetext?: boolean
}]
// ----- markdown-preferences/list-marker-alignment -----
type MarkdownPreferencesListMarkerAlignment = []|[{
  align?: ("left" | "right")
}]
// ----- markdown-preferences/no-multiple-empty-lines -----
type MarkdownPreferencesNoMultipleEmptyLines = []|[{
  max?: number
  maxEOF?: number
  maxBOF?: number
}]
// ----- markdown-preferences/no-trailing-spaces -----
type MarkdownPreferencesNoTrailingSpaces = []|[{
  skipBlankLines?: boolean
  ignoreComments?: boolean
}]
// ----- markdown-preferences/ordered-list-marker-start -----
type MarkdownPreferencesOrderedListMarkerStart = []|[{
  start?: (1 | 0)
}]
// ----- markdown-preferences/ordered-list-marker-style -----
type MarkdownPreferencesOrderedListMarkerStyle = []|[{
  prefer?: ("n." | "n)")
  overrides?: {
    level?: number
    parentMarker?: ("n." | "n)" | "any" | "bullet")
    prefer?: ("n." | "n)")
  }[]
}]
// ----- markdown-preferences/padding-line-between-blocks -----
type MarkdownPreferencesPaddingLineBetweenBlocks = {
  prev: (("blockquote" | "code" | "heading" | "html" | "list" | "paragraph" | "thematic-break" | "table" | "link-definition" | "footnote-definition" | "frontmatter" | "*") | [("blockquote" | "code" | "heading" | "html" | "list" | "paragraph" | "thematic-break" | "table" | "link-definition" | "footnote-definition" | "frontmatter" | "*"), ...(("blockquote" | "code" | "heading" | "html" | "list" | "paragraph" | "thematic-break" | "table" | "link-definition" | "footnote-definition" | "frontmatter" | "*"))[]] | {
    type: (("blockquote" | "code" | "heading" | "html" | "list" | "paragraph" | "thematic-break" | "table" | "link-definition" | "footnote-definition" | "frontmatter" | "*") | [("blockquote" | "code" | "heading" | "html" | "list" | "paragraph" | "thematic-break" | "table" | "link-definition" | "footnote-definition" | "frontmatter" | "*"), ...(("blockquote" | "code" | "heading" | "html" | "list" | "paragraph" | "thematic-break" | "table" | "link-definition" | "footnote-definition" | "frontmatter" | "*"))[]])
    in?: ("list" | "blockquote" | "footnote-definition")
  })
  next: (("blockquote" | "code" | "heading" | "html" | "list" | "paragraph" | "thematic-break" | "table" | "link-definition" | "footnote-definition" | "frontmatter" | "*") | [("blockquote" | "code" | "heading" | "html" | "list" | "paragraph" | "thematic-break" | "table" | "link-definition" | "footnote-definition" | "frontmatter" | "*"), ...(("blockquote" | "code" | "heading" | "html" | "list" | "paragraph" | "thematic-break" | "table" | "link-definition" | "footnote-definition" | "frontmatter" | "*"))[]] | {
    type: (("blockquote" | "code" | "heading" | "html" | "list" | "paragraph" | "thematic-break" | "table" | "link-definition" | "footnote-definition" | "frontmatter" | "*") | [("blockquote" | "code" | "heading" | "html" | "list" | "paragraph" | "thematic-break" | "table" | "link-definition" | "footnote-definition" | "frontmatter" | "*"), ...(("blockquote" | "code" | "heading" | "html" | "list" | "paragraph" | "thematic-break" | "table" | "link-definition" | "footnote-definition" | "frontmatter" | "*"))[]])
    in?: ("list" | "blockquote" | "footnote-definition")
  })
  blankLine: ("any" | "never" | "always")
}[]
// ----- markdown-preferences/prefer-inline-code-words -----
type MarkdownPreferencesPreferInlineCodeWords = []|[{
  words: string[]
  ignores?: {
    words?: (string | string[])
    node?: {
      [k: string]: unknown | undefined
    }
    [k: string]: unknown | undefined
  }[]
  [k: string]: unknown | undefined
}]
// ----- markdown-preferences/prefer-link-reference-definitions -----
type MarkdownPreferencesPreferLinkReferenceDefinitions = []|[{
  
  minLinks?: number
}]
// ----- markdown-preferences/prefer-linked-words -----
type MarkdownPreferencesPreferLinkedWords = []|[{
  words: ({
    [k: string]: (string | null)
  } | string[])
  ignores?: {
    words?: (string | string[])
    node?: {
      [k: string]: unknown | undefined
    }
    [k: string]: unknown | undefined
  }[]
  [k: string]: unknown | undefined
}]
// ----- markdown-preferences/setext-heading-underline-length -----
type MarkdownPreferencesSetextHeadingUnderlineLength = []|[{
  mode?: ("exact" | "minimum" | "consistent" | "consistent-line-length")
  align?: ("any" | "exact" | "minimum" | "length")
  length?: number
}]
// ----- markdown-preferences/sort-definitions -----
type MarkdownPreferencesSortDefinitions = []|[{
  order?: (string | [string, ...(string)[]] | {
    match: (string | [string, ...(string)[]])
    sort: ("alphabetical" | "ignore")
  })[]
  alphabetical?: boolean
}]
// ----- markdown-preferences/strikethrough-delimiters-style -----
type MarkdownPreferencesStrikethroughDelimitersStyle = []|[{
  delimiter?: ("~" | "~~")
}]
// ----- markdown-preferences/table-header-casing -----
type MarkdownPreferencesTableHeaderCasing = []|[{
  style?: ("Title Case" | "Sentence case")
  
  preserveWords?: string[]
  
  ignorePatterns?: string[]
  
  minorWords?: string[]
}]
// ----- markdown-preferences/thematic-break-character-style -----
type MarkdownPreferencesThematicBreakCharacterStyle = []|[{
  style?: ("-" | "*" | "_")
}]
// ----- markdown-preferences/thematic-break-length -----
type MarkdownPreferencesThematicBreakLength = []|[{
  length?: number
}]
// ----- markdown-preferences/thematic-break-sequence-pattern -----
type MarkdownPreferencesThematicBreakSequencePattern = []|[{
  pattern: (string | string | string)
}]