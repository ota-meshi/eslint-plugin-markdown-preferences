export const LIST_CATEGORIES = ["Preference", "Stylistic"];

export const CATEGORY_DESCRIPTIONS: Record<string, string | undefined> = {
  Preference:
    "Rules to unify the expression and description style of documents.",
  Stylistic: "Rules related to the formatting and visual style of Markdown.",
};

/**
 * Compares two category names.
 */
export function compareCategories(a: string, b: string): number {
  const aIndex = LIST_CATEGORIES.indexOf(a);
  const bIndex = LIST_CATEGORIES.indexOf(b);
  if (aIndex === -1 && bIndex === -1) {
    return a > b ? 1 : a < b ? -1 : 0;
  }
  return aIndex - bIndex;
}
