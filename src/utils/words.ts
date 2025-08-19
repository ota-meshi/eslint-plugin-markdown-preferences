export type WordAndOffset = {
  word: string;
  offset: number;
  punctuation: boolean;
  first: boolean;
  last: boolean;
};

/**
 * Parse text into words with offsets
 */
export function parseWordsFromText(
  text: string,
  firstNode: boolean,
  lastNode: boolean,
): WordAndOffset[] {
  const words: WordAndOffset[] = [];

  // Use regex to match word patterns, emoji and punctuation separately
  const pattern = /(\w+(?:[^\s\w]\w+)*|:\w+:|[^\s\w]+|\s+)/gu;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const token = match[1];

    // Skip whitespace
    if (/^\s+$/.test(token)) {
      continue;
    }

    // Check if token is purely emoji/punctuation/symbols (no word characters)
    const punctuation = /^(?::\w+:|[^\s\w]+)$/.test(token);

    words.push({
      word: token,
      offset: match.index,
      punctuation,
      first: false,
      last: false,
    });
  }

  if (firstNode) {
    for (const w of words) {
      // Mark first word
      if (!w.punctuation) {
        w.first = true;
        break;
      }
    }
  }

  if (lastNode) {
    for (let i = words.length - 1; i >= 0; i--) {
      // Mark first and last words
      const w = words[i];
      if (!w.punctuation) {
        w.last = true;
        break;
      }
    }
  }

  return words;
}
