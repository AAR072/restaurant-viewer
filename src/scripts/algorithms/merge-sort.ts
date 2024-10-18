type CompareCallback = (a: number, b: number) => number

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
      rightPoint++;
    }
  }

  while (leftPoint < leftLength) {
    arr[low + pointer++] = temp[leftPoint++];
  }

  while (rightPoint < rightLength) {
    arr[low + pointer++] = temp[leftLength + rightPoint++];
  }
}

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

function sortArray<T>(arr: T[], compare: CompareCallback): Uint32Array {
  const length = arr.length;
  const sorted = new Uint32Array(length);

  sort(sorted, 0, length - 1, compare);

  return sorted;
}

function getOrderMap(sorted: Uint32Array) {
  const orderMap = new Array(100000);

  for (let i = 0; i < 100000; i++) {
    orderMap[sorted[i]] = i;
  }

  return orderMap;
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