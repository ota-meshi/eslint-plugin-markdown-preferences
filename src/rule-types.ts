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
   * require link definitions and footnote definitions to be placed at the end of the document
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/definitions-last.html
   */
  'markdown-preferences/definitions-last'?: Linter.RuleEntry<[]>
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
// ----- markdown-preferences/no-trailing-spaces -----
type MarkdownPreferencesNoTrailingSpaces = []|[{
  skipBlankLines?: boolean
  ignoreComments?: boolean
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