/**
 * Compile an ordered list of patterns into a matcher.
 *
 * A negated pattern removes matching values from the result, while a regular
 * pattern adds them. If the first pattern is negated, all values are initially
 * considered to match. Patterns are applied in order.
 */
export function compilePatternMatcher<T>(
  patterns: string[],
  compile: (pattern: string) => (value: T) => boolean,
): (value: T) => boolean {
  const rules = patterns.map((pattern) => {
    const negative = pattern.startsWith("!");
    const patternStr = negative ? pattern.slice(1) : pattern;
    return {
      negative,
      match: compile(patternStr),
    };
  });

  return (value) => {
    // If the first rule is a negative pattern, values are considered to match
    // until they match that pattern.
    let result = Boolean(rules[0]?.negative);
    for (const { negative, match } of rules) {
      if (result === !negative) {
        // Even if this rule matches, it cannot change the current result.
        continue;
      }
      if (match(value)) {
        result = !negative;
      }
    }
    return result;
  };
}
