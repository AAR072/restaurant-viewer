/**
 * Returns the values stored in a hash table
 * @param hash The hash table storing the count of each value.
 * @param amount The amount of values which meet the requirement in the hash table.
 * @param required The required value for each index in the hashtable for it to be added.
 * @param sortBy The array who's order of values is used to order the valid indices in the hash table.
 * @param indexRange The range of indices of the sorted array.
 * @returns An array of valid keys in the hash table in order of their order in the `sortBy` array.
 * @timecomplexity O(n), where n is the index range.
 */
function getSorted(
  hashTable: number[],
  amount: number,
  required: number,
  sortBy: Uint32Array,
  indexRange: number
): Uint32Array {
  const sorted: Uint32Array = new Uint32Array(amount);
  let sortedPointer: number = 0;

  for (let i: number = 0; i < indexRange; i++) {
    if (sortedPointer >= amount) break;

    const value: number = sortBy[i];

    if (hashTable[value] === required) sorted[sortedPointer++] = value;
  }

  return sorted;
}

/**
 * Returns the intersection of multiple sorted `Uint32Array` arrays.
 * It finds common elements that appear in all input arrays.
 *
 * @param data - An arbitrary number of sorted `Uint32Array` arrays to intersect.
 * @param indexRange - The range of values for the hash table.
 * @param sortBy - An optional parameter used to sort the intersected values based on their order in another array.
 * @returns A new `Uint32Array` containing the elements common to all input arrays.
 *
 * @timecomplexity O(n * m) - Where `n` is the length of the largest array and `m` is the number of arrays. We iterate through all elements of each array (O(n * m)) and use a hash table for lookup (O(1)).
 */
function getIntersections(
  data: (Uint32Array | number[])[],
  indexRange: number,
  sortBy?: Uint32Array
): Uint32Array {
  const t0: number = performance.now();

  const dataSetCount: number = data.length;
  const requiredCount: number = dataSetCount - 1;

  const firstSet: number[] | Uint32Array = data[0];
  const firstLength: number = firstSet.length;

  if (firstLength === 0) return new Uint32Array(0);

  // Utilize the stack using a set index range.
  const hashTable: number[] = new Array(indexRange);

  // Count occurrences of each element in the subsequent arrays
  for (let i: number = 1; i < dataSetCount; i++) {
    const dataSet: number[] | Uint32Array = data[i];
    const setLength: number = dataSet.length;

    if (setLength === 0) return new Uint32Array(0);

    for (let j: number = 0; j < setLength; j++) {
      const value: number = dataSet[j];

      if (hashTable[value]) hashTable[value]++;
      else hashTable[value] = 1;
    }
  }

  const duplicates: number[] = [];
  let dupePointer: number = 0;

  // Check elements of the first array for intersection
  for (let i: number = 0; i < firstLength; i++) {
    const value: number = firstSet[i];

    if (hashTable[value] === requiredCount) {
      duplicates[dupePointer++] = value;
      hashTable[value]++;
    }
  }

  if (sortBy && dupePointer > 1) {
    const sorted: Uint32Array = getSorted(
      hashTable,
      dupePointer,
      dataSetCount,
      sortBy,
      indexRange
    ); //new Uint32Array(dupePointer);
    // let sortedPointer = 0;

    // for (let i = 0; i < indexRange; i++) {
    //   if (sortedPointer >= dupePointer) break;

    //   const value = sortBy[i];

    //   if (hashTable[value] == dataSetCount) sorted[sortedPointer++] = value;
    // }

    const t1: number = performance.now();
    logTask(
      'Array Intersection',
      t1 - t0,
      'Found intersections between arrays and sorted them in custom order'
    );

    return sorted;
  }

  const t2: number = performance.now();
  logTask('Array Intersection', t2 - t0, 'Found intersections between arrays');

  return new Uint32Array(duplicates);
}

/**
 * Sorts the elements of the `indices` array according to the order defined by `sortedIndices`.
 * It returns a new `Uint32Array` with elements of `indices` sorted based on their appearance in `sortedIndices`.
 *
 * @param indices - The array of indices to be sorted.
 * @param indexRange - The size of the range that elements in `indices` and `sortedIndices` can take. This value helps initialize the hash table.
 * @param sortedIndices - The reference array which defines the desired order of the `indices` array elements.
 * @returns A new `Uint32Array` with elements of `indices` sorted based on `sortedIndices`.
 *
 * @timecomplexity O(n + m), where n is the length of `indices` and m is `indexRange`.
 */
function sortBy(
  indices: Uint32Array | number[],
  indexRange: number,
  sortedIndices: Uint32Array
): Uint32Array {
  const length: number = indices.length;
  const hashTable: number[] = new Array(indexRange);

  for (let i: number = 0; i < length; i++) {
    hashTable[indices[i]] = 1;
  }

  return getSorted(hashTable, length, 1, sortedIndices, indexRange);
}
