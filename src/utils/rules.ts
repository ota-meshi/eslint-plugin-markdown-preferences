// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "npm run update"
import type { RuleModule } from "../types.ts";
import canonicalCodeBlockLanguage from "../rules/canonical-code-block-language.ts";
import definitionsLast from "../rules/definitions-last.ts";
import hardLinebreakStyle from "../rules/hard-linebreak-style.ts";
import headingCasing from "../rules/heading-casing.ts";
import noLazinessBlockquotes from "../rules/no-laziness-blockquotes.ts";
import noMultipleEmptyLines from "../rules/no-multiple-empty-lines.ts";
import noTextBackslashLinebreak from "../rules/no-text-backslash-linebreak.ts";
import noTrailingSpaces from "../rules/no-trailing-spaces.ts";
import orderedListMarkerSequence from "../rules/ordered-list-marker-sequence.ts";
import preferAutolinks from "../rules/prefer-autolinks.ts";
import preferFencedCodeBlocks from "../rules/prefer-fenced-code-blocks.ts";
import preferInlineCodeWords from "../rules/prefer-inline-code-words.ts";
import preferLinkReferenceDefinitions from "../rules/prefer-link-reference-definitions.ts";
import preferLinkedWords from "../rules/prefer-linked-words.ts";
import sortDefinitions from "../rules/sort-definitions.ts";

export const rules = [
  canonicalCodeBlockLanguage,
  definitionsLast,
  hardLinebreakStyle,
  headingCasing,
  noLazinessBlockquotes,
  noMultipleEmptyLines,
  noTextBackslashLinebreak,
  noTrailingSpaces,
  orderedListMarkerSequence,
  preferAutolinks,
  preferFencedCodeBlocks,
  preferInlineCodeWords,
  preferLinkReferenceDefinitions,
  preferLinkedWords,
  sortDefinitions,
] as RuleModule[];
