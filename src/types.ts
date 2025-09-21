import type { RuleContext as CoreRuleContext } from "@eslint/core";
import type {
  MarkdownLanguageOptions,
  MarkdownRuleDefinition,
} from "@eslint/markdown/types";
import type { JSONSchema4 } from "json-schema";
import type { Node } from "./language/ast-types.ts";
import type {
  ExtendedMarkdownRuleVisitor,
  ExtendedMarkdownSourceCode,
} from "./language/extended-markdown-language.ts";

export type RuleContext<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
  O extends any[],
> = CoreRuleContext<{
  LangOptions: MarkdownLanguageOptions;
  Code: ExtendedMarkdownSourceCode;
  RuleOptions: O;
  Node: Node;
  MessageIds: string;
}>;

export interface RuleModule extends MarkdownRuleDefinition {
  meta: RuleMetaData;
  create(context: RuleContext<unknown[]>): ExtendedMarkdownRuleVisitor;
}

export type ListCategory =
  | "Preference"
  | "Whitespace"
  | "Notation"
  | "Decorative";

export interface RuleMetaData {
  docs: {
    description: string;
    categories: ("recommended" | "standard")[] | null;
    listCategory: ListCategory;
    url: string;
    ruleId: string;
    ruleName: string;
    default?: "error" | "warn";
  };
  messages: { [messageId: string]: string };
  fixable?: "code" | "whitespace";
  hasSuggestions?: boolean;
  schema: JSONSchema4 | JSONSchema4[];
  deprecated?: boolean;
  replacedBy?: string[];
  type: "problem" | "suggestion" | "layout";
}

export interface PartialRuleModule<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
  O extends any[],
> {
  meta: PartialRuleMetaData;
  create(context: RuleContext<O>): ExtendedMarkdownRuleVisitor;
}

export interface PartialRuleMetaData {
  docs: {
    description: string;
    categories: ["recommended", "standard"] | ["standard"] | [] | null;
    default?: "error" | "warn";
    listCategory: ListCategory;
  };
  messages: { [messageId: string]: string };
  fixable?: "code" | "whitespace";
  hasSuggestions?: boolean;
  schema: JSONSchema4 | JSONSchema4[];
  deprecated?: boolean;
  replacedBy?: string[];
  type: "problem" | "suggestion" | "layout";
}
