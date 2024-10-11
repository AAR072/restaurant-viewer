enum Filter {
  VALID = 0,
  UP = 1,
  DOWN = 2
}

type FilterCallback = (i: number) => Filter

function filterSplice(indices: number[], min: number, max: number): number[] {
  console.log(min, max);
  const length = max - min + 1;
  const results = new Array(length);

  for (let i = 0; i < length; i++) {
    results[0] = indices[min + i];
  }

  return results;
}

function search(indices: number[], filter: FilterCallback, secondary?: boolean, low: number = 0, high: number = indices.length - 1): number[] | number | null {
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
          return middleIndex;

        } else {
          const maxIndex: number | null = search(indices, filter, true, middleIndex, extentHigh) as number | null;

          return filterSplice(indices, middleIndex, maxIndex == null ? middleIndex : maxIndex);
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
      high = high;

    } else {
      low = low;
      high = middle;
    }
  }

  if (secondary) return null;
  else return new Array(0);
}

function filterNumbers(data: number[], sortedIndices: number[], min: number, max: number) {
  return search(sortedIndices, (i: number) => {
    let value = data[i];

    if (value >= min && value <= max) return Filter.VALID;
    else if (value > max) return Filter.DOWN;
    else return Filter.UP;
  });
}

function filterStrings(data: string[], sortedIndices: number[], searchInput: string) {
  const len = searchInput.length;

  return search(sortedIndices, (index: number) => {
    const value = data[index];

    let matched = true;
    
    for (let i = 0; i < len; i++) {
      if (value[i].toLowerCase() != searchInput[i].toLowerCase()) {
        matched = false;

        break;
      }
    }
  
    if (matched) return Filter.VALID;
    else {
      const comparison = value.localeCompare(searchInput);
  
      if (comparison > 0) return Filter.UP;
      else return Filter.DOWN;
    }
  });
}