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
// ----- markdown-preferences/prefer-linked-words -----
type MarkdownPreferencesPreferLinkedWords = []|[{
  words: ({
    [k: string]: (string | null)
  } | string[])
  [k: string]: unknown | undefined
}]