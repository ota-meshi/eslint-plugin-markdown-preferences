import diffSequence from "diff-sequences";

export type DeleteEntry<E> = {
  type: "delete";
  a: E;
};
export type InsertEntry<E> = {
  type: "insert";
  b: E;
};
export type CommonEntry<E> = {
  type: "common";
  a: E;
  b: E;
};
export type DiffEntry<E> = DeleteEntry<E> | InsertEntry<E> | CommonEntry<E>;

/**
 * Given the contents of two sequences, returns diff information.
 * @param a The first sequence.
 * @param b The second sequence.
 * @param [options] The options object.
 * @param [options.isEqual] A function that returns true if two elements are equal.
 * @returns An array of diff objects.
 */
export function calcShortestEditScript<E>(a: E[], b: E[]): DiffEntry<E>[] {
  let aStartIndex = 0;
  let bStartIndex = 0;
  const result: DiffEntry<E>[] = [];

  (diffSequence.default || diffSequence)(
    a.length,
    b.length,
    (aIndex: number, bIndex: number) => a[aIndex] === b[bIndex],
    (nCommon, aCommon, bCommon) => {
      pushDelIns(aStartIndex, aCommon, bStartIndex, bCommon);
      aStartIndex = aCommon + nCommon;
      bStartIndex = bCommon + nCommon;

      if (nCommon > 0) {
        for (let index = 0; index < nCommon; index++) {
          const elementA = a[aCommon + index];
          const elementB = b[bCommon + index];
          result.push({
            type: "common",
            a: elementA,
            b: elementB,
          });
        }
      }
    },
  );

  // After the last common subsequence, push remaining change sequences.
  pushDelIns(aStartIndex, a.length, bStartIndex, b.length);

  return result;

  /**
   * Pushes delete and insert sequences to the result.
   * @param aStart The start index of the delete sequence in `a`.
   * @param aEnd The end index of the delete sequence in `a`.
   * @param bStart The start index of the insert sequence in `b`.
   * @param bEnd The end index of the insert sequence in `b`.
   */
  function pushDelIns(
    aStart: number,
    aEnd: number,
    bStart: number,
    bEnd: number,
  ) {
    for (const element of a.slice(aStart, aEnd)) {
      result.push({
        type: "delete",
        a: element,
      });
    }
    for (const element of b.slice(bStart, bEnd)) {
      result.push({
        type: "insert",
        b: element,
      });
    }
  }
}
