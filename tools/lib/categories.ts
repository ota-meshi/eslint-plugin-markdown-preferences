import type { ListCategory } from "../../src/types.ts";

export const LIST_CATEGORIES: ListCategory[] = [
  "Preference",
  "Notation",
  "Whitespace",
  "Decorative",
];

export const CATEGORY_DESCRIPTIONS: Record<ListCategory, string | undefined> = {
  Preference:
    "Rules to unify the expression and description style of documents.",
  Notation: "Rules related to notation styles in Markdown.",
  Whitespace: "Rules related to whitespace styles in Markdown.",
  Decorative: "Rules related to visual or stylistic decorations in Markdown.",
};

/**
 * Compares two category names.
 */
export function compareCategories(a: string, b: string): number {
  const aIndex = LIST_CATEGORIES.indexOf(a as ListCategory);
  const bIndex = LIST_CATEGORIES.indexOf(b as ListCategory);
  if (aIndex === -1 && bIndex === -1) {
    return a > b ? 1 : a < b ? -1 : 0;
  }
  return aIndex - bIndex;
}
