type FilterCallback = (i: number) => number

// Returns sub array of existing array, starting and ending at new indices
function getSubArray(indices: Uint32Array, min: number, max: number): Uint32Array {
  return new Uint32Array(indices.buffer, min*Uint32Array.BYTES_PER_ELEMENT, max - min + 1);
}

// Returns the lowest/highest value which matches the applied filter
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

// Returns a spliced array of the values in the indices array that do match the filter
function getFiltered(indices: Uint32Array, filter: FilterCallback): Uint32Array {
  const min = binarySearch(indices, filter, false);
  const max = binarySearch(indices, filter, true);

  return (min >= 0 && max >= 0) ? getSubArray(indices, min, max) : new Uint32Array(0);
}

function filterNumbers(data: number[], sortedIndices: Uint32Array, min: number, max: number): Uint32Array {
  return getFiltered(sortedIndices, (i: number) => {
    let value = data[i];

    return value < min ? -1 : (value > max ? 1 : 0);
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