enum Filter {
  INVALID = -1,
  VALID = 0,
  DOWN = 1,
  UP = 2,
}

type FilterCallback = (a: number) => Filter

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