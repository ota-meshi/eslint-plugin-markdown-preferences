const RE_REGEXP_STR = /^\/(.+)\/([A-Za-z]*)$/u;

declare global {
  interface String {
    // See https://github.com/microsoft/TypeScript/issues/61448
    matchAll(regexp: {
      [Symbol.matchAll](s: string): RegExpStringIterator<RegExpExecArray>;
    }): RegExpStringIterator<RegExpExecArray>;
  }
}

export type GlobalRegExpMatcher = {
  [Symbol.matchAll](s: string): RegExpStringIterator<RegExpExecArray>;
};

export type StickyRegExpMatcher = {
  lastIndex: number;
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
 * Convert a string to the `GlobalRegExpMatcher` with global flag.
 * Normal strings (e.g. `"foo"`) is converted to `/^foo$/g` of `GlobalRegExpMatcher`.
 * Strings like `"/^foo/i"` are converted to `/^foo/ig` of `GlobalRegExpMatcher`.
 *
 * @param {string} string The string to convert.
 * @returns {GlobalRegExpMatcher} Returns the `GlobalRegExpMatcher`.
 */
export function toGlobalRegExpMatcher(string: string): GlobalRegExpMatcher {
  const parts = RE_REGEXP_STR.exec(string);
  if (parts) {
    return regexpToGlobalMatcher(parts[1], parts[2]);
  }
  return stringToGlobalMatcher(string);
}

/**
 * Convert a string to the `RegExpMatcher` with sticky flag.
 * Normal strings (e.g. `"foo"`) is converted to `/^foo$/y` of `RegExpMatcher`.
 * Strings like `"/^foo/i"` are converted to `/^foo/iy` of `RegExpMatcher`.
 *
 * @param {string} string The string to convert.
 * @returns {StickyRegExpMatcher} Returns the `StickyRegExpMatcher`.
 */
export function toStickyRegExpMatcher(string: string): StickyRegExpMatcher {
  const parts = RE_REGEXP_STR.exec(string);
  if (parts) {
    return regexpToStickyMatcher(parts[1], parts[2]);
  }
  return stringToStickyMatcher(string);
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
 * Convert a `RegExp` to the `GlobalRegExpMatcher` with global flag.
 */
function regexpToGlobalMatcher(
  source: string,
  flags: string,
): GlobalRegExpMatcher {
  const regexpWithGlobal = new RegExp(source, `${flags.replace(/[gy]/u, "")}g`);
  return regexpWithGlobal;
}

/**
 * Convert a `RegExp` to the `StickyRegExpMatcher` with sticky flag.
 */
function regexpToStickyMatcher(
  source: string,
  flags: string,
): StickyRegExpMatcher {
  const regexpWithSticky = new RegExp(source, `${flags.replace(/[gy]/u, "")}y`);
  return regexpWithSticky;
}

/**
 * Convert a string to the `GlobalRegExpMatcher` with global flag.
 */
function stringToGlobalMatcher(string: string): GlobalRegExpMatcher {
  return {
    [Symbol.matchAll](s): RegExpStringIterator<RegExpExecArray> {
      return iterateAll(s);
    },
  };

  /**
   * Iterate all matches of the string in the given string.
   */
  function* iterateAll(s: string): RegExpStringIterator<RegExpExecArray> {
    let index: number;
    let startIndex = 0;
    while ((index = s.indexOf(string, startIndex)) !== -1) {
      const array = [string] as unknown as RegExpExecArray;
      array.index = index;
      array.input = s;
      startIndex = index + string.length;
      yield array;
    }
  }
}

/**
 * Convert a string to the `StickyRegExpMatcher` with sticky flag.
 */
function stringToStickyMatcher(string: string): StickyRegExpMatcher {
  let lastIndex = 0;
  return {
    get lastIndex() {
      return lastIndex;
    },
    set lastIndex(value: number) {
      lastIndex = value;
    },
    [Symbol.replace](s: string, replacement: string): string {
      if (s.startsWith(string, lastIndex)) {
        const before = s.slice(0, lastIndex);
        const after = s.slice(lastIndex + string.length);
        lastIndex += replacement.length;
        return before + replacement + after;
      }
      return s;
    },
  };
}
