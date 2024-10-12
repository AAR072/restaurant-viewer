enum Filter {
  VALID = 0,
  UP = 1,
  DOWN = 2
}

type FilterCallback = (i: number) => Filter

function filterSplice(indices: number[], min: number, max: number): number[] {
  const length = max - min + 1;
  const results = new Array(length);

  for (let i = 0; i < length; i++) {
    results[i] = indices[min + i];
  }

  return results;
}

function search(indices: number[], filter: FilterCallback, secondary: boolean = false, low: number = 0, high: number = indices.length - 1): number[] | number | null {
  let extentHigh = high;

  while (low < high) {
    let middle = floor(low + (high - low)/2);
    let middleIndex = indices[middle];

    let border = secondary ? middle + 1 : middle - 1;
    let borderIndex = indices[border];

    let middleCheck = filter(middleIndex);
    let borderCheck = filter(borderIndex);

    if (!secondary && middleCheck == Filter.VALID && extentHigh == null) {
      extentHigh = high;
    }

    if (middleCheck == Filter.VALID) {
      if (borderCheck != Filter.VALID) {
        if (secondary) {
          return middle;

        } else {
          const maximum: number | null = search(indices, filter, true, middle, extentHigh) as number | null;

          return filterSplice(indices, middle, maximum == null ? extentHigh : maximum);
        }

      } else {
        if (secondary) low = middle + 1;
        else {
          high = middle;

          if (extentHigh == null) extentHigh = high;
        }
      }

    } else if (middleCheck == Filter.UP) {
      low = middle + 1;

    } else {
      high = middle;
    }
  }

  if (secondary) return null;
  else return new Array(0);
}

function filterNumbers(data: number[], sortedIndices: number[], min: number, max: number): number[] {
  return search(sortedIndices, (i: number) => {
    let value = data[i];

    if (value >= min && value <= max) return Filter.VALID;
    else if (value > max) return Filter.DOWN;
    else return Filter.UP;
  }) as number[];
}

function filterStrings(data: string[], sortedIndices: number[], searchInput: string): number[] {
  const len = searchInput.length;

  return search(sortedIndices, (index: number) => {
    const value = data[index];
    const comparison = value.localeCompare(searchInput);

    if (comparison == 0) return Filter.VALID;
    
    for (let i = 0; i < len; i++) {
      if (value[i] == null || value[i].toLowerCase() != searchInput[i].toLowerCase()) {
        const comparison = value.localeCompare(searchInput);
  
        if (comparison > 0) return Filter.DOWN;
        else return Filter.UP;
      }
    }

    return Filter.VALID;
  }) as number[];
}