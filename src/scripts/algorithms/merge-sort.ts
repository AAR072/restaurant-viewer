enum Compare {
  LESS = -1,
  EQUAL = 0,
  MORE = 1
}

type CompareCallback = (a: number, b: number) => Compare

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

function sortArray<T>(arr: T[], compare: CompareCallback): number[] {
  const length = arr.length;
  const sorted = new Array(length);

  sort(sorted, 0, length - 1, compare);

  return sorted;
}

function sortNumbers(arr: number[]): number[] {
  return sortArray<number>(arr, (a: number, b: number) => {
    const aVal = arr[a];
    const bVal = arr[b];
  
    if (aVal > bVal) return Compare.MORE;
    else if (aVal < bVal) return Compare.LESS;
    else return Compare.EQUAL;
  });
}

function sortStrings(arr: string[]): number[] {
  return sortArray<string>(arr, (a: number, b: number) => {
    const difference = arr[a].localeCompare(arr[b]);
  
    if (difference > 0) return Compare.MORE;
    else if (difference < 0) return Compare.LESS;
    else return Compare.EQUAL;
  });
}