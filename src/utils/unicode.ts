/**
 * Check if the string is whitespace
 */
export function isWhitespace(string: string): boolean {
  return /^[\p{Zs}\t\n\f\r]+$/u.test(string);
}

/**
 * Check if the string is a space or tab
 */
export function isSpaceOrTab(string: string): boolean {
  return /^[\t ]+$/u.test(string);
}

/**
 * Check if the character is a punctuation character
 */
export function isPunctuation(char: string): boolean {
  return /^[\p{P}\p{S}]+$/u.test(char);
}

/**
 * Check if the character is an ASCII control character
 */
export function isAsciiControlCharacter(char: string): boolean {
  // eslint-disable-next-line no-control-regex -- Control characters
  return /^[\x00-\x1f\x7f]+$/u.test(char);
}
