import type {
  RuleContext as CoreRuleContext,
  RuleDefinition as CoreRuleDefinition,
} from "@eslint/core";
import type { MarkdownSourceCode } from "@eslint/markdown";
import type {
  MarkdownLanguageOptions,
  MarkdownRuleVisitor,
} from "@eslint/markdown/types";
import type { JSONSchema4 } from "json-schema";

export type RuleContext<O extends any[]> = CoreRuleContext<{
  LangOptions: MarkdownLanguageOptions;
  Code: MarkdownSourceCode;
  RuleOptions: O;
  Node: unknown;
  MessageIds: string;
}>;

export interface RuleModule
  extends CoreRuleDefinition<{
    LangOptions: MarkdownLanguageOptions;
    Code: MarkdownSourceCode;
    RuleOptions: unknown[];
    Node: unknown;
    MessageIds: string;
    Visitor: MarkdownRuleVisitor;
    ExtRuleDocs: unknown;
  }> {
  meta: RuleMetaData;
  create(context: RuleContext<unknown[]>): MarkdownRuleVisitor;
}

export interface RuleMetaData {
  docs: {
    description: string;
    categories: "recommended"[] | null;
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

export interface PartialRuleModule<O extends any[]> {
  meta: PartialRuleMetaData;
  create(context: RuleContext<O>): MarkdownRuleVisitor;
}

export interface PartialRuleMetaData {
  docs: {
    description: string;
    categories: "recommended"[] | null;
    default?: "error" | "warn";
  };
  messages: { [messageId: string]: string };
  fixable?: "code" | "whitespace" | null;
  hasSuggestions?: boolean;
  schema: JSONSchema4 | JSONSchema4[];
  deprecated?: boolean;
  replacedBy?: string[];
  type: "problem" | "suggestion" | "layout";
}
