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
   * enforce consistent hard linebreak style.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/hard-linebreak-style.html
   */
  'markdown-preferences/hard-linebreak-style'?: Linter.RuleEntry<MarkdownPreferencesHardLinebreakStyle>
  /**
   * disallow text backslash at the end of a line.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/no-text-backslash-linebreak.html
   */
  'markdown-preferences/no-text-backslash-linebreak'?: Linter.RuleEntry<[]>
  /**
   * trailing whitespace at the end of lines in Markdown files.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/no-trailing-spaces.html
   */
  'markdown-preferences/no-trailing-spaces'?: Linter.RuleEntry<MarkdownPreferencesNoTrailingSpaces>
  /**
   * enforce the use of inline code for specific words.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-inline-code-words.html
   */
  'markdown-preferences/prefer-inline-code-words'?: Linter.RuleEntry<MarkdownPreferencesPreferInlineCodeWords>
  /**
   * enforce the specified word to be a link.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-linked-words.html
   */
  'markdown-preferences/prefer-linked-words'?: Linter.RuleEntry<MarkdownPreferencesPreferLinkedWords>
}

/* ======= Declarations ======= */
// ----- markdown-preferences/hard-linebreak-style -----
type MarkdownPreferencesHardLinebreakStyle = []|[{
  style?: ("backslash" | "spaces")
}]
// ----- markdown-preferences/no-trailing-spaces -----
type MarkdownPreferencesNoTrailingSpaces = []|[{
  skipBlankLines?: boolean
  ignoreComments?: boolean
}]
// ----- markdown-preferences/prefer-inline-code-words -----
type MarkdownPreferencesPreferInlineCodeWords = []|[{
  words: string[]
  [k: string]: unknown | undefined
}]
// ----- markdown-preferences/prefer-linked-words -----
type MarkdownPreferencesPreferLinkedWords = []|[{
  words: ({
    [k: string]: (string | null)
  } | string[])
  [k: string]: unknown | undefined
}]