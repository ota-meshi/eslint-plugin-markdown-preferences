export class PreserveWordsContext {
  private readonly preserveWords: Map<string, string[]>;

  private readonly preservePhrases: string[][];

  public constructor(preserveWordsOption: string[]) {
    const preserveWords = new Map<string, string[]>();

    /**
     * Add a single word to the preserveWords map
     */
    function addPreserveWord(word: string) {
      const lowerWord = word.toLowerCase();
      let list = preserveWords.get(lowerWord);
      if (!list) {
        list = [];
        preserveWords.set(lowerWord, list);
      }
      list.push(word);
    }

    const preservePhrases = new Map<string, string[]>();
    for (const word of preserveWordsOption) {
      const splitted = word.split(/\s+/);
      if (splitted.length <= 1) {
        // Single word
        addPreserveWord(word);
      } else {
        // Multi-word phrases
        preservePhrases.set(word, splitted);
        addPreserveWord(splitted.join(""));
      }
    }

    this.preserveWords = preserveWords;
    this.preservePhrases = [...preservePhrases.values()].sort(
      (a, b) => b.length - a.length,
    );
  }

  public findPreserveWord(word: string): string[] | null {
    return this.preserveWords.get(word.toLowerCase()) ?? null;
  }

  public findPreservePhrase(words: Iterator<string>): string[] | null {
    const firstWord = words.next();
    if (firstWord.done) return null;

    const firstLowerWord = firstWord.value.toLowerCase();
    let returnCandidate: {
      preservePhrase: string[];
      matchCount: number;
    } | null = null;
    const subWords: string[] = [firstWord.value];
    for (const phrase of this.preservePhrases) {
      if (
        returnCandidate &&
        returnCandidate.preservePhrase.length !== phrase.length
      )
        break;
      if (firstLowerWord !== phrase[0].toLowerCase()) continue;
      while (subWords.length < phrase.length) {
        const word = words.next();
        if (word.done) break;
        subWords.push(word.value);
      }

      if (
        subWords.length >= phrase.length &&
        subWords
          .slice(0, phrase.length)
          .every((word, i) => word.toLowerCase() === phrase[i].toLowerCase())
      ) {
        let matchCount = 0;
        for (let i = 0; i < phrase.length; i++) {
          const word = subWords[i];
          if (word === phrase[i]) {
            matchCount++;
          }
        }
        if (!returnCandidate || matchCount > returnCandidate.matchCount) {
          returnCandidate = {
            preservePhrase: phrase,
            matchCount,
          };
        }
      }
    }
    return returnCandidate?.preservePhrase ?? null;
  }
}

/**
 * Parse preserve words and phrases from the options
 * - Single words are added to preserveWords
 * - Multi-word phrases are added to preservePhrases and added to preserveWords with no spaces
 */
export function parsePreserveWordsOption(
  preserveWordsOption: string[],
): PreserveWordsContext {
  return new PreserveWordsContext(preserveWordsOption);
}
