enum Compare {
  LESS = -1,
  EQUAL = 0,
  MORE = 1
}

enum Filter {
  INVALID = -1,
  VALID = 0,
  DOWN = 1,
  UP = 2,
}

type CompareCallback = (a: number, b: number) => Compare

type FilterCallback = (a: number) => Filter

function floor(n: number) {
  return n - n % 1;
}

// Sorting

function merge<T>(arr: number[], low: number, mid: number, high: number, compare: CompareCallback) {
  const leftLength = mid - low + 1;
  const rightLength = high - mid;
  const length = high - low + 1;

  const left: number[] = new Array(leftLength);
  const right: number[] = new Array(rightLength);

  for (let i = 0; i < leftLength; i++) left[i] = arr[low + i];
  for (let i = 0; i < rightLength; i++) right[i] = arr[mid + 1 + i];

  let leftPoint = 0;
  let rightPoint = 0;
  let pointer = 0;

  while (pointer < length) {
    if (rightPoint >= rightLength || (leftPoint < leftLength && compare(left[leftPoint], right[rightPoint]) == Compare.LESS)) {
      // fix and understand this ^^^
      arr[low + pointer] = left[leftPoint];
      leftPoint++;

    } else {
      arr[low + pointer] = right[rightPoint];
      rightPoint++;
    }

    pointer++;
  }
}

function sort<T>(sorted: number[], left: number, right: number, compare: CompareCallback) {
  if (left >= right) {
    sorted[right] = right;

    return;
  }

  const middle = floor(left + (right - left)/2);

  sort<T>(sorted, left, middle, compare);
  sort<T>(sorted, middle + 1, right, compare);
  merge<T>(sorted, left, middle, right, compare);
}

function sortArray<T>(arr: T[], compare: CompareCallback) {
  const length = arr.length;
  const sorted = new Array(length);

  sort(sorted, 0, length - 1, compare);

  return sorted;
}

export function sortNumbers(arr: number[]) {
  return sortArray<number>(arr, (a: number, b: number) => {
    const aVal = arr[a];
    const bVal = arr[b];
  
    if (aVal > bVal) return Compare.MORE;
    else if (aVal < bVal) return Compare.LESS;
    else return Compare.EQUAL;
  });
}

export function sortStrings(arr: string[]) {
  return sortArray<string>(arr, (a: number, b: number) => {
    const difference = arr[a].localeCompare(arr[b]);
  
    if (difference > 0) return Compare.MORE;
    else if (difference < 0) return Compare.LESS;
    else return Compare.EQUAL;
  });
}

// Searching

function search(indices: number[], filter: FilterCallback): number | void {
  let low = 0;
  let high = indices.length - 1;

  while (low < high) {
    let middle = floor(low + (high - low)/2);
    let middleIndex = indices[middle];

    let prev = middle - 1;
    let prevIndex = indices[prev];

    let middleCheck = filter(middleIndex);
    let prevCheck = filter(prevIndex);

    if (middleCheck == Filter.VALID) {
      // const results = searchScan(indices, middle, low, high, filter)
      return middleIndex;

    } else if (middleCheck == Filter.UP) {
      low = middle + 1;
      high = high;

    } else if (middleCheck == Filter.DOWN) {
      low = low;
      high = middle;

    } else {
      break;
    }
  }
}

// Testing

// let input = "aa";
// let results = search<number>(sorted, (a: number) => {
//   const value = data.storeName[a];
//   const matched = value.substring(0, input.length);

//   if (matched.toLowerCase() == input.toLowerCase()) return Filter.VALID;
//   else {
//     const comparison = value.localeCompare(input);

//     if (comparison > 0) return Filter.UP;
//     if (comparison < 0) return Filter.DOWN;
//     else return Filter.INVALID;
//   }
// });