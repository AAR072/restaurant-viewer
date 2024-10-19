/**
 * Returns the intersection of multiple sorted `Uint32Array` arrays. 
 * It finds common elements that appear in all input arrays.
 *
 * @param {...Uint32Array[]} data - An arbitrary number of sorted `Uint32Array` arrays to intersect.
 * @return {Uint32Array} - A new `Uint32Array` containing the elements common to all input arrays.
 * 
 * @timecomplexity O(n * m) - Where `n` is the length of the largest array and `m` is the number of arrays. We iterate through all elements of each array (O(n * m)) and use a hash table for lookup (O(1)).
 */
function getIntersections(...data: Uint32Array[]): Uint32Array {
  const dataSetCount = data.length;
  const requiredCount = dataSetCount - 1;

  const firstSet = data[0];
  const firstLength = firstSet.length;
  
  // We know the max size is 100k, so we can utilize the stack.
  const hashTable = new Array(100000);

  // Count occurrences of each element in the subsequent arrays
  for (let i = 1; i < dataSetCount; i++) {
    const dataSet = data[i];
    const setLength = dataSet.length;

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

  return new Uint32Array(duplicates);
}
