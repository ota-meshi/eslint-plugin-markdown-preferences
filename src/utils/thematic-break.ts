/**
 * Check if the pattern is valid within the thematic break string.
 */
export function isValidThematicBreakPattern(
  pattern: string,
  text: string,
): boolean {
  for (let i = 0; i < text.length; i += pattern.length) {
    const subSequence = text.slice(i, i + pattern.length);
    if (subSequence === pattern) continue;
    if (subSequence.length < pattern.length && pattern.startsWith(subSequence))
      continue;
    return false;
  }
  return true;
}

/**
 * Create a thematic break string from a pattern and length.
 */
export function createThematicBreakFromPattern(
  pattern: string,
  length: number,
): string | null {
  const mark = pattern[0];
  let candidate = pattern.repeat(Math.floor(length / pattern.length));
  if (candidate.length < length) {
    candidate += pattern.slice(0, length - candidate.length);
  }
  candidate = candidate.trim();
  if (candidate.length !== length) return null;
  let markCount = 0;
  for (const c of candidate) {
    if (c !== mark) continue;
    markCount++;
    if (markCount >= 3) return candidate;
  }
  return null;
}
