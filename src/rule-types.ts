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
   * enforce the specified word to be a link.
   * @see https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/prefer-linked-words.html
   */
  'markdown-preferences/prefer-linked-words'?: Linter.RuleEntry<MarkdownPreferencesPreferLinkedWords>
}

/* ======= Declarations ======= */
// ----- markdown-preferences/prefer-linked-words -----
type MarkdownPreferencesPreferLinkedWords = []|[{
  words: ({
    [k: string]: (string | null)
  } | string[])
  [k: string]: unknown | undefined
}]