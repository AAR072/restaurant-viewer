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

function sortArray(arr: (number | string)[] | Uint32Array | Float32Array, compare: CompareCallback, sorted?: Uint32Array): Uint32Array {
  const length = arr.length;

  if (sorted == null) sorted = new Uint32Array(length);

  sort(sorted, 0, length - 1, compare);

  return sorted;
}

function sortNumbers(data: number[] | Uint32Array | Float32Array, outSorted?: Uint32Array): Uint32Array {
  return sortArray(data, (a: number, b: number) => {
    return data[a] - data[b];
  }, outSorted);
}

function sortStrings(data: string[], outSorted?: Uint32Array): Uint32Array {
  return sortArray(data, (a: number, b: number) => {
    return data[a].localeCompare(data[b]);
  }, outSorted);
}

function getSortOrders(sorted: Uint32Array, outOrders?: Uint32Array) {
  const length = sorted.length;

  if (outOrders == null) outOrders = new Uint32Array(length);

  for (let i = 0; i < length; i++) {
    outOrders[sorted[i]] = i;
  }

  return outOrders;
}