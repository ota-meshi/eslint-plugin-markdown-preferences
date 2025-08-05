// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "npm run update"
import type { RuleModule } from "../types.ts";
import definitionsLast from "../rules/definitions-last.ts";
import hardLinebreakStyle from "../rules/hard-linebreak-style.ts";
import noTextBackslashLinebreak from "../rules/no-text-backslash-linebreak.ts";
import noTrailingSpaces from "../rules/no-trailing-spaces.ts";
import preferInlineCodeWords from "../rules/prefer-inline-code-words.ts";
import preferLinkReferenceDefinitions from "../rules/prefer-link-reference-definitions.ts";
import preferLinkedWords from "../rules/prefer-linked-words.ts";

export const rules = [
  definitionsLast,
  hardLinebreakStyle,
  noTextBackslashLinebreak,
  noTrailingSpaces,
  preferInlineCodeWords,
  preferLinkReferenceDefinitions,
  preferLinkedWords,
] as RuleModule[];
