type CompareCallback = (a: number, b: number) => number

// Sorting

function merge<T>(arr: Uint32Array, low: number, mid: number, high: number, compare: CompareCallback) {
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
    if (rightPoint >= rightLength || (leftPoint < leftLength && compare(left[leftPoint], right[rightPoint]) < 0)) {
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

function sort<T>(sorted: Uint32Array, left: number, right: number, compare: CompareCallback) {
  if (left >= right) {
    sorted[right] = right;

    return;
  }

  const middle = floor(left + (right - left)/2);

  sort<T>(sorted, left, middle, compare);
  sort<T>(sorted, middle + 1, right, compare);
  merge<T>(sorted, left, middle, right, compare);
}

function sortArray<T>(arr: T[], compare: CompareCallback): Uint32Array {
  const length = arr.length;
  const sorted = new Uint32Array(length);

  sort(sorted, 0, length - 1, compare);

  return sorted;
}

function sortNumbers(arr: number[]): Uint32Array {
  return sortArray<number>(arr, (a: number, b: number) => {
    return arr[a] - arr[b];
  });
}

function sortStrings(arr: string[]): Uint32Array {
  return sortArray<string>(arr, (a: number, b: number) => {
    return arr[a].localeCompare(arr[b]);
  });
}