// Words that should not be capitalized in title case (unless they're the first or last word)
const articles = ["a", "an", "the"];
// See https://en.wikipedia.org/wiki/Conjunction_(grammar)#Coordinating_conjunctions
const conjunctions = ["for", "and", "nor", "but", "or", "yet", "so"];
// The prepositions of two letters or fewer.
// See https://en.wikipedia.org/wiki/List_of_English_prepositions
const prepositions = [
  "a",
  "as",
  "at",
  "by",
  "ex",
  "in",
  "of",
  "on",
  "re",
  "to",
  "up",
];

export const defaultMinorWords = [
  ...articles,
  ...conjunctions,
  ...prepositions,
];
