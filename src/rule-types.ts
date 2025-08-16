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
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/atx-headings-closing-sequence.html
   */
  'markdown-preferences/atx-headings-closing-sequence'?: Linter.RuleEntry<MarkdownPreferencesAtxHeadingsClosingSequence>
  /**
   * enforce consistent length for the closing sequence (trailing #s) in ATX headings.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/atx-headings-closing-sequence-length.html
   */
  'markdown-preferences/atx-headings-closing-sequence-length'?: Linter.RuleEntry<MarkdownPreferencesAtxHeadingsClosingSequenceLength>
  /**
   * enforce canonical language names in code blocks
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/canonical-code-block-language.html
   */
  'markdown-preferences/canonical-code-block-language'?: Linter.RuleEntry<MarkdownPreferencesCanonicalCodeBlockLanguage>
  /**
   * require link definitions and footnote definitions to be placed at the end of the document
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/definitions-last.html
   */
  'markdown-preferences/definitions-last'?: Linter.RuleEntry<[]>
  /**
   * Enforce consistent emoji notation style in Markdown files.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/emoji-notation.html
   */
  'markdown-preferences/emoji-notation'?: Linter.RuleEntry<MarkdownPreferencesEmojiNotation>
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
   * enforce a specific order for link definitions and footnote definitions
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/sort-definitions.html
   */
  'markdown-preferences/sort-definitions'?: Linter.RuleEntry<MarkdownPreferencesSortDefinitions>
}

/* ======= Declarations ======= */
// ----- markdown-preferences/atx-headings-closing-sequence -----
type MarkdownPreferencesAtxHeadingsClosingSequence = []|[{
  closingSequence?: ("always" | "never")
}]
// ----- markdown-preferences/atx-headings-closing-sequence-length -----
type MarkdownPreferencesAtxHeadingsClosingSequenceLength = []|[{
  mode?: ("match-opening" | "length" | "consistent" | "consistent-line-length" | "fixed-line-length")
  length?: number
}]
// ----- markdown-preferences/canonical-code-block-language -----
type MarkdownPreferencesCanonicalCodeBlockLanguage = []|[{
  languages?: {
    [k: string]: string
  }
}]
// ----- markdown-preferences/emoji-notation -----
type MarkdownPreferencesEmojiNotation = []|[{
  
  prefer?: ("unicode" | "colon")
  
  ignoreUnknown?: boolean
  
  ignoreList?: string[]
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
// ----- markdown-preferences/sort-definitions -----
type MarkdownPreferencesSortDefinitions = []|[{
  order?: (string | [string, ...(string)[]] | {
    match: (string | [string, ...(string)[]])
    sort: ("alphabetical" | "ignore")
  })[]
  alphabetical?: boolean
}]