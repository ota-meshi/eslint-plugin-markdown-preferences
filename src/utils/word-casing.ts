export type CaseStyle = "Title Case" | "Sentence case";
/**
 * Converts the casing of a word based on the specified case style and whether it is the first or last word in a phrase.
 */
export function convertWordCasing(
  {
    word,
    first,
    last,
  }: {
    word: string;
    first: boolean;
    last: boolean;
  },
  { caseStyle, minorWords }: { caseStyle: CaseStyle; minorWords: string[] },
): { word: string; isMinorWord: boolean } {
  if (caseStyle === "Title Case") {
    // Always capitalize first and last words
    if (first || last) {
      return {
        word: word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        isMinorWord: false,
      };
    }

    // Check if it's a word that should remain lowercase
    if (
      minorWords.some(
        (minorWord) => minorWord.toLowerCase() === word.toLowerCase(),
      )
    ) {
      return {
        word: word.toLowerCase(),
        isMinorWord: true,
      };
    }

    // Capitalize other words
    return {
      word: word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      isMinorWord: false,
    };
  }

  // Sentence case
  if (first) {
    return {
      word: word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      isMinorWord: false,
    };
  }
  return {
    word: word.toLowerCase(),
    isMinorWord: false,
  };
}
