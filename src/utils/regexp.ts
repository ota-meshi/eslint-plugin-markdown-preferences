const RE_REGEXP_STR = /^\/(.+)\/([A-Za-z]*)$/u;

declare global {
  interface String {
    // See https://github.com/microsoft/TypeScript/issues/61448
    matchAll(regexp: {
      [Symbol.matchAll](s: string): RegExpStringIterator<RegExpExecArray>;
    }): RegExpStringIterator<RegExpExecArray>;
  }
}

export type RegExpMatcher = {
  [Symbol.matchAll](s: string): RegExpStringIterator<RegExpExecArray>;
  [Symbol.replace](s: string, replacement: string): string;
};

/**
 * Convert a string to the `RegExp` like object.
 * Normal strings (e.g. `"foo"`) is converted to `/^foo$/` of `RegExp`.
 * Strings like `"/^foo/i"` are converted to `/^foo/i` of `RegExp`.
 *
 * @param {string} string The string to convert.
 * @returns {RegExp} Returns the `RegExp`.
 */
export function toRegExp(string: string): { test(s: string): boolean } {
  const parts = RE_REGEXP_STR.exec(string);
  if (parts) {
    return new RegExp(parts[1], parts[2]);
  }
  return { test: (s) => s === string };
}

/**
 * Convert a string to the `RegExpMatcher`.
 * Normal strings (e.g. `"foo"`) is converted to `/^foo$/` of `RegExpMatcher`.
 * Strings like `"/^foo/i"` are converted to `/^foo/i` of `RegExpMatcher`.
 *
 * @param {string} string The string to convert.
 * @returns {RegExpMatcher} Returns the `RegExpMatcher`.
 */
export function toRegExpMatcher(string: string): RegExpMatcher {
  const parts = RE_REGEXP_STR.exec(string);
  if (parts) {
    const regexp = new RegExp(parts[1], parts[2]);
    return regexpToMatcher(regexp);
  }
  return stringToMatcher(string);
}

/**
 * Checks whether given string is regexp string
 * @param {string} string
 * @returns {boolean}
 */
export function isRegExp(string: string): boolean {
  return Boolean(RE_REGEXP_STR.test(string));
}

/**
 * Convert a `RegExp` to the `RegExpMatcher`.
 */
function regexpToMatcher(regexp: RegExp): RegExpMatcher {
  let regexpWithGlobal: RegExp | null = regexp.global ? regexp : null;
  return {
    [Symbol.matchAll](s): RegExpStringIterator<RegExpExecArray> {
      if (!regexpWithGlobal) {
        regexpWithGlobal = new RegExp(regexp.source, `${regexp.flags}g`);
      }
      return regexpWithGlobal[Symbol.matchAll](s);
    },
    [Symbol.replace](s: string, replacement: string): string {
      return s.replace(regexp, replacement);
    },
  };
}

/**
 * Convert a string to the `RegExpMatcher`.
 */
function stringToMatcher(string: string): RegExpMatcher {
  return {
    [Symbol.matchAll](s): RegExpStringIterator<RegExpExecArray> {
      return iterate(s);
    },
    [Symbol.replace](s: string, replacement: string): string {
      let result = "";
      let lastIndex = 0;
      for (const match of iterate(s)) {
        result += s.slice(lastIndex, match.index) + replacement;
        lastIndex = match.index + string.length;
      }
      result += s.slice(lastIndex);
      return result;
    },
  };

  /**
   * Iterate all matches of the string in the given string.
   */
  function* iterate(s: string): RegExpStringIterator<RegExpExecArray> {
    let index = s.indexOf(string);
    while (index !== -1) {
      const array = [string] as unknown as RegExpExecArray;
      array.index = index;
      array.input = s;
      yield array;
      index = s.indexOf(string, index + string.length);
    }
  }
}
