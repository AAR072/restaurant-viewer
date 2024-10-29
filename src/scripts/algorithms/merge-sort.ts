type CompareCallback = (a: number, b: number) => number

/**
 * Merges two halves of array `arr` based on the comparison logic provided by `compare`.
 *
 * @param {Uint32Array} arr - The array being sorted.
 * @param {number} low - The starting index of the first half.
 * @param {number} mid - The ending index of the first half.
 * @param {number} high - The ending index of the second half.
 * @param {CompareCallback} compare - A callback that compares two elements, returning:
 *   - a negative number if the first element is less than the second,
 *   - zero if they are equal, or
 *   - a positive number if the first element is greater than the second.
 *
 * @timecomplexity O(n) - Merging two sorted subarrays requires a linear scan through both halves, where `n` is the total number of elements in the two halves combined.
 */
function merge(arr: Uint32Array, low: number, mid: number, high: number, compare: CompareCallback) {
  const leftLength = mid - low + 1;
  const rightLength = high - mid;
  const length = leftLength + rightLength;

  const temp = new Array(length);

  for (let i = 0; i < leftLength; i++) temp[i] = arr[low + i];
  for (let i = 0; i < rightLength; i++) temp[leftLength + i] = arr[mid + 1 + i];

  let leftPoint = 0;
  let rightPoint = 0;
  let pointer = 0;

  while (leftPoint < leftLength && rightPoint < rightLength) {
    const left = temp[leftPoint];
    const right = temp[leftLength + rightPoint];

    if (compare(left, right) < 0) {
      arr[low + pointer++] = left;
      leftPoint++;
    } else {
      arr[low + pointer++] = right;
      rightPoint++; }
  }

  while (leftPoint < leftLength) {
    arr[low + pointer++] = temp[leftPoint++];
  }

  while (rightPoint < rightLength) {
    arr[low + pointer++] = temp[leftLength + rightPoint++];
  }
}

/**
 * Recursively sorts a `Uint32Array` using merge sort and the provided comparison callback.
 *
 * @param {Uint32Array} sorted - The array of sorted indices.
 * @param {number} left - The starting index for the sort.
 * @param {number} right - The ending index for the sort.
 * @param {CompareCallback} compare - A callback that compares two elements.
 *
 * @timecomplexity O(n log n) - Merge sort recursively divides the array into halves (O(log n)) and merges them back together (O(n)).
 */
function sort(sorted: Uint32Array, left: number, right: number, compare: CompareCallback) {
  if (left >= right) {
    sorted[right] = right;

    return;
  }

  const middle = (left + right) >>> 1;

  sort(sorted, left, middle, compare);
  sort(sorted, middle + 1, right, compare);
  merge(sorted, left, middle, right, compare);
}

/**
 * Sorts an array of numbers, strings, or typed arrays using merge sort and the provided comparison callback.
 *
 * @param {(number | string)[] | Uint32Array | Float32Array} arr - The array of data to sort.
 * @param {CompareCallback} compare - A callback that compares two elements.
 * @param {Uint32Array} [sorted] - An optional array to store the sorted indices.
 * @returns {Uint32Array} A new `Uint32Array` containing the sorted indices of `arr`.
 * 
 * @timecomplexity O(n log n) - The function calls `sort`, which uses merge sort (O(n log n)).
 */
function sortArray(arr: (number | string)[] | Uint32Array | Float32Array, compare: CompareCallback, sorted?: Uint32Array): Uint32Array {
  const t0 = performance.now();
  const length = arr.length;

  if (sorted == null) sorted = new Uint32Array(length);

  sort(sorted, 0, length - 1, compare);

  const t1 = performance.now();
  logTask("Sorted Array", t1 - t0, `Sorted an array of ${typeof arr[0]}s`);
  
  return sorted;
}

/**
 * Sorts an array of numbers using merge sort.
 *
 * @param {number[] | Uint32Array | Float32Array} data - The array of numbers to sort.
 * @param {Uint32Array} [outSorted] - An optional array to store the sorted indices.
 * @returns {Uint32Array} A `Uint32Array` containing the sorted indices of `data`.
 * 
 * @timecomplexity O(n log n) - The function uses `sortArray`, which internally calls merge sort (O(n log n)).
 */
function sortNumbers(data: number[] | Uint32Array | Float32Array, outSorted?: Uint32Array): Uint32Array {
  return sortArray(data, (a: number, b: number) => {
    return data[a] - data[b];
  }, outSorted);
}

/**
 * Sorts an array of strings using merge sort.
 *
 * @param {string[]} data - The array of strings to sort.
 * @param {Uint32Array} [outSorted] - An optional array to store the sorted indices.
 * @returns {Uint32Array} A `Uint32Array` containing the sorted indices of `data`.
 * 
 * @timecomplexity O(n log n) - The function uses `sortArray`, which internally calls merge sort (O(n log n)).
 */
function sortStrings(data: string[], outSorted?: Uint32Array): Uint32Array {
  return sortArray(data, (a: number, b: number) => {
    if (data[a] < data[b]) return -1;
    if (data[a] > data[b]) return 1;
    return 0;
  }, outSorted);
}
