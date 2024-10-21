/**
 * Returns the intersection of multiple sorted `Uint32Array` arrays. 
 * It finds common elements that appear in all input arrays.
 *
 * @param {...Uint32Array[]} data - An arbitrary number of sorted `Uint32Array` arrays to intersect.
 * @returns {Uint32Array} A new `Uint32Array` containing the elements common to all input arrays.
 * 
 * @timecomplexity O(n * m) - Where `n` is the length of the largest array and `m` is the number of arrays. We iterate through all elements of each array (O(n * m)) and use a hash table for lookup (O(1)).
 */
function getIntersections(data: (Uint32Array | number[])[], indexRange: number, sortBy?: Uint32Array): Uint32Array {
  const t0 = performance.now();
  const dataSetCount = data.length;
  const requiredCount = dataSetCount - 1;

  const firstSet = data[0];
  const firstLength = firstSet.length;

  if (firstLength == 0) return new Uint32Array(0);
  
  // Utilize the stack using a set index range.
  const hashTable = new Array(indexRange);

  // Count occurrences of each element in the subsequent arrays
  for (let i = 1; i < dataSetCount; i++) {
    const dataSet = data[i];
    const setLength = dataSet.length;

    if (setLength == 0) {
      return new Uint32Array(0);
    }

    for (let j = 0; j < setLength; j++) {
      const value = dataSet[j];

      if (!hashTable[value]) { 
        hashTable[value] = 1;
      } else hashTable[value]++;
    }
  }

  const duplicates: number[] = [];
  let dupePointer = 0;

  // Check elements of the first array for intersection
  for (let i = 0; i < firstLength; i++) {
    const value = firstSet[i];

    if (hashTable[value] == requiredCount) {
      duplicates[dupePointer++] = value;
    }
  }

  if (sortBy) {
    const length = duplicates.length;
    const sorted = new Uint32Array(length);
    let sortedPointer = 0;
    
    for (let i = 0; i < indexRange; i++) {
      const value = sortBy[i];

      if (hashTable[value]) sorted[sortedPointer++] = value;
    }
    const t1 = performance.now();
    logTask(
      "Get Intersections", 
      t1-t0, Date.now(), 
      `Found intersection in an array and sorted with custom parameters`, 
      "taskContainer"
    );
    return sorted;
  }
  const t2 = performance.now();
  logTask(
    "Get Intersections", 
    t2-t0, Date.now(), 
    `Found intersection in an array`, 
    "taskContainer"
  );
  return new Uint32Array(duplicates);
}

/**
 * Sorts the elements of the `indices` array according to the order defined by `sortedIndices`. 
 * It returns a new `Uint32Array` with elements of `indices` sorted based on their appearance in `sortedIndices`.
 *
 * @param {Uint32Array | number[]} indices - The array of indices to be sorted.
 * @param {number} indexRange - The size of the range that elements in `indices` and `sortedIndices` can take. This value helps initialize the hash table.
 * @param {Uint32Array} sortedIndices - The reference array which defines the desired order of the `indices` array elements.
 * @returns {Uint32Array} A new `Uint32Array` with elements of `indices` sorted based on `sortedIndices`.
 * 
 * @timecomplexity O(n + m) - Where `n` is the length of the `indices` array and `m` is the length of `sortedIndices`. The hash table lookup for each element is O(1).
 */
function sortBy(indices: Uint32Array | number[], indexRange: number, sortedIndices: Uint32Array): Uint32Array {
  const length = indices.length;
  const hashTable: boolean[] = new Array(indexRange);

  for (let i = 0; i < length; i++) {
    hashTable[indices[i]] = true;
  }

  const sorted = new Uint32Array(length);
  let sortedPointer = 0;
  
  for (let i = 0; i < indexRange; i++) {
    const value = sortedIndices[i];

    if (hashTable[value]) sorted[sortedPointer++] = value;
  }

  return sorted;
}