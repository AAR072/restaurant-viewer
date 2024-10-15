type FilterCallback = (i: number) => number

function filterSplice(indices: Uint32Array, min: number, max: number): Uint32Array {
  const length = max - min + 1;
  const results = new Uint32Array(length);

  for (let i = 0; i < length; i++) {
    results[i] = indices[min + i];
  }

  return results;
}

function binarySearch(indices: Uint32Array, filter: FilterCallback, isMaximum: boolean): number {
  let low = 0;
  let high = indices.length - 1;

  while (low < high) {
    let sum = low + high;
    if (isMaximum) sum += 1;

    const middle = floor(sum/2);
    const result = filter(indices[middle]);

    if (isMaximum) {
      if (result > 0) high = middle - 1;
      else low = middle;
    } else {
      if (result < 0) low = middle + 1;
      else high = middle;
    }
  }

  if (filter(indices[low]) == 0) return low;
  else return -1;
}

function getFiltered(indices: Uint32Array, filter: FilterCallback): Uint32Array {
  const min = binarySearch(indices, filter, false);
  const max = binarySearch(indices, filter, true);

  if (min < 0 || max < 0 || min > max) return new Uint32Array(0);

  return filterSplice(indices, min, max);
}

function filterNumbers(data: number[], sortedIndices: Uint32Array, min: number, max: number): Uint32Array {
  return getFiltered(sortedIndices, (i: number) => {
    let value = data[i];

    if (value >= min && value <= max) return 0;
    else if (value > max) return 1;
    else return -1;
  });
}

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

function getIntersections(...data: Uint32Array[]): number[] {
  const existing: number[] = [];
  const setCount = data.length;

  for (let i = 0; i < setCount; i++) {
    for (let j = 0; j < data[i].length; j++) {
      const val = data[i][j];
      const current = existing[val];

      if (current == null) existing[val] = 0;
      else existing[val]++;
    }
  }

  const common: number[] = [];
  let pointer = 0;

  existing.forEach((value: number, index: number) => {
    if (value == setCount - 1) {
      common[pointer] = index;
      pointer++;
    }
  });

  return common;
}

let t11 = performance.now();
console.log(getIntersections(
  new Uint32Array([0, 1, 2]),
  new Uint32Array([1, 2, 3]),
  new Uint32Array([2, 3, 4])
));
let t22 = performance.now();
console.log("Above performance ^^^", t22 - t11);