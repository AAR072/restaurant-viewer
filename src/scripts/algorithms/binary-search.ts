type FilterCallback = (i: number) => number

/**
 * Returns a subarray of an existing array, starting and ending at new indices.
 *
 * @param indices - The array of indices to slice from.
 * @param min - The starting index for the subarray.
 * @param max - The ending index for the subarray.
 * @returns A new subarray of `indices` from `min` to `max`.
 * 
 * @timecomplexity O(1) - This function performs pointer arithmetic and creates a view on an existing buffer, both of which are O(1) operations.
 */
function getSubArray(indices: Uint32Array, min: number, max: number): Uint32Array {
  // We change the start and end of the array in place to save time. We just spliced in constant time!
  return new Uint32Array(indices.buffer, min*Uint32Array.BYTES_PER_ELEMENT, max - min + 1);
}

/**
 * Performs a binary search on the `indices` array to find the lowest or highest value that matches the `filter` condition.
 *
 * @param indices - Array of indices to search.
 * @param filter - A callback function that takes an index and returns:
 *   - -1 if the value is less than the target.
 *   - 0 if the value matches the target.
 *   - 1 if the value is greater than the target.
 * @param isMaximum - If true, searches for the highest match; otherwise, searches for the lowest match.
 * @returns The index of the matching element if found, or -1 if no match exists.
 * 
 * @timecomplexity O(log n) - The function performs a binary search, dividing the search space in half with each iteration.
 */
function binarySearch(indices: Uint32Array, filter: FilterCallback, isMaximum: boolean): number {
  const t0 = performance.now();

  let low = 0;
  let high = indices.length - 1;

  // standard binary search procedure
  while (low < high) {
    const middle = (low + high + (isMaximum ? 1 : 0)) >>> 1;
    const result = filter(indices[middle]);

    // We move over right pointer past the middle
    if (result > 0) high = middle + 1;
    // Move over the left pointer
    else low = middle;

    if (isMaximum) { // Searching for highest match
      if (result > 0) high = middle - 1;
      else low = middle;

    } else { // Lowest match
      if (result < 0) low = middle + 1;
      else high = middle;
    }
  }

  const t1 = performance.now();

  logTask("Binary Search", t1 - t0, `Searched for ${isMaximum ? 'maximum' : 'minimum'} index that matches the filter.`);

  return filter(indices[low]) == 0 ? low : -1;
}

/**
 * Filters the `indices` array based on the given `filter` callback, returning a
 * subarray of indices that match the filter condition.
 *
 * @param indices - Array of indices to filter.
 * @param filter - A callback function that determines whether an element should be included by returning:
 *   - -1 if the value is less than the filter criteria.
 *   - 0 if the value matches the filter criteria.
 *   - 1 if the value is greater than the filter criteria.
 * @returns A subarray of `indices` that match the filter condition.
 * 
 * @timecomplexity O(2 * log n + 1) => O(log n) - The function calls `binarySearch` twice (O(log n)) and slices the array (O(1)).
 */
function getFiltered(indices: Uint32Array, filter: FilterCallback): Uint32Array {
  const min = binarySearch(indices, filter, false);
  const max = binarySearch(indices, filter, true);

  return (min >= 0 && max >= 0) ? getSubArray(indices, min, max) : new Uint32Array(0);
}

/**
 * Filters an array of numbers, returning the indices of elements that fall
 * within a specified range [min, max].
 *
 * @param data - The array of data to filter.
 * @param sortedIndices - The array of sorted indices into `data`.
 * @param min - The minimum value of the desired range.
 * @param max - The maximum value of the desired range.
 * @returns A subarray of indices whose values fall within [min, max].
 * 
 * @timecomplexity O(log n) - This function leverages `getFiltered`, which has O(log n) complexity.
 */
function filterNumbers(data: number[], sortedIndices: Uint32Array, min: number, max: number): Uint32Array {
  return getFiltered(sortedIndices, (i: number) => {
    let value = data[i];

    return value < min ? -1 : (value > max ? 1 : 0);
  });
}

/**
 * Filters an array of strings, returning the indices of elements that match the
 * given search input (case-insensitive prefix search).
 *
 * @param data - The array of data to filter.
 * @param sortedIndices - The array of sorted indices into `data`.
 * @param searchInput - The search string to match (case-insensitive).
 * @returns A subarray of indices whose values match the search input.
 * 
 * @timecomplexity O(log n * m) - The function uses binary search (O(log n)) and compares string prefixes (O(m)), where `m` is the search input length.
 */
function filterStrings(data: string[], sortedIndices: Uint32Array, searchInput: string): Uint32Array {
  searchInput = searchInput.toLowerCase();

  const len = searchInput.length;

  return getFiltered(sortedIndices, (index: number) => {
    const value = data[index].toLowerCase();
    const vLen = value.length;

    if (value == searchInput) return 0;

    // Loops through search input and returns -1 or 1 if individual characters do not match
    for (let i = 0; i < len; i++) {
      if (i >= vLen) return -1;

      const charA = value[i];
      const charB = searchInput[i];

      if (charA < charB) {
        return -1;

      } else if (charA > charB) {
        return 1;
      }
    }
    
    return 0;
  });
}