type FilterCallback = (i: number) => number

/**
 * Returns a subarray of an existing array, starting and ending at new indices.
 *
 * @param {Uint32Array} indices - The array of indices to slice from.
 * @param {number} min - The starting index for the subarray.
 * @param {number} max - The ending index for the subarray.
 * @return {Uint32Array} - A new subarray of `indices` from `min` to `max`.
 * 
 * @timecomplexity O(1) - This function performs pointer arithmetic and creates a view on an existing buffer, both of which are O(1) operations.
 */
function getSubArray(indices: Uint32Array, min: number, max: number): Uint32Array {
  // We change the start and end of the array in place to save time. We just spliced in constant time!
  return new Uint32Array(indices.buffer, min * Uint32Array.BYTES_PER_ELEMENT, max - min + 1);
}

/**
 * Performs a binary search on the `indices` array to find the lowest or highest
 * value that matches the `filter` condition.
 *
 * @param {Uint32Array} indices - Array of indices to search.
 * @param {FilterCallback} filter - A callback function that takes an index and returns:
 *   - -1 if the value is less than the target.
 *   - 0 if the value matches the target.
 *   - 1 if the value is greater than the target.
 * @param {boolean} isMaximum - If true, searches for the highest match; otherwise, searches for the lowest match.
 * @return {number} - The index of the matching element if found, or -1 if no match exists.
 * 
 * @timecomplexity O(log n) - The function performs a binary search, dividing the search space in half with each iteration.
 */
function binarySearch(indices: Uint32Array, filter: FilterCallback, isMaximum: boolean): number {
  let low = 0;
  let high = indices.length - 1;

  while (low < high) {
    const middle = (low + high + (isMaximum ? 1 : 0)) >>> 1;
    const result = filter(indices[middle]);

    if (isMaximum) {
      if (result > 0) high = middle - 1;
      else low = middle;
    } else {
      if (result < 0) low = middle + 1;
      else high = middle;
    }
  }

  return filter(indices[low]) == 0 ? low : -1;
}

/**
 * Filters the `indices` array based on the given `filter` callback, returning a
 * subarray of indices that match the filter condition.
 *
 * @param {Uint32Array} indices - Array of indices to filter.
 * @param {FilterCallback} filter - A callback function that determines whether an element should be included:
 *   - -1 if the value is less than the filter criteria.
 *   - 0 if the value matches the filter criteria.
 *   - 1 if the value is greater than the filter criteria.
 * @return {Uint32Array} - A subarray of `indices` that match the filter condition.
 * 
 * @timecomplexity O(2 * log n + n) => O(log n) - The function calls `binarySearch` twice (O(log n)) and slices the array (O(n)).
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
 * @param {number[]} data - The array of data to filter.
 * @param {Uint32Array} sortedIndices - The array of sorted indices into `data`.
 * @param {number} min - The minimum value of the desired range.
 * @param {number} max - The maximum value of the desired range.
 * @return {Uint32Array} - A subarray of indices whose values fall within [min, max].
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
 * @param {string[]} data - The array of data to filter.
 * @param {Uint32Array} sortedIndices - The array of sorted indices into `data`.
 * @param {string} searchInput - The search string to match (case-insensitive).
 * @return {Uint32Array} - A subarray of indices whose values match the search input.
 * 
 * @timecomplexity O(log n * m) - The function uses binary search (O(log n)) and compares string prefixes (O(m)), where `m` is the search input length.
 */
function filterStrings(data: string[], sortedIndices: Uint32Array, searchInput: string): Uint32Array {
  const len = searchInput.length;

  return getFiltered(sortedIndices, (index: number) => {
    const value = data[index];
    const vLen = value.length;
    const comparison = value.localeCompare(searchInput);

    if (comparison == 0) return 0;

    for (let i = 0; i < len; i++) {
      if (i >= vLen || value[i].toLowerCase() != searchInput[i].toLowerCase()) {
        return comparison;
      }
    }

    return 0;
  });
}
