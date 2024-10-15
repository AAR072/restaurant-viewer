enum Filter {
  VALID = 0,
  MORE = 1,
  LESS = 2
}

type FilterCallback = (i: number) => Filter

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
      if (result == Filter.MORE) high = middle - 1;
      else low = middle;
    } else {
      if (result == Filter.LESS) low = middle + 1;
      else high = middle;
    }
  }

  if (filter(low) == Filter.VALID) return low;
  else return -1;
}

function getFiltered(indices: Uint32Array, filter: FilterCallback): Uint32Array {
  let t1 = performance.now();
  const min = binarySearch(indices, filter, false);
  let t2 = performance.now();
  console.log("Test1", t2 - t1);

  let t3 = performance.now();
  const max = binarySearch(indices, filter, true);
  let t4 = performance.now();
  console.log("Test2", t4 - t3);

  console.log("Test3", t1 - t1);

  if (min < 0 || max < 0 || min > max) return new Uint32Array(0);

  return filterSplice(indices, min, max);
}

// function search(indices: Uint32Array, filter: FilterCallback, secondary: boolean = false, low: number = 0, high: number = indices.length - 1): Uint32Array | number | null {
//   let extentHigh = high;

//   while (low < high) {
//     let middle = floor(low + (high - low) / 2);
//     let middleIndex = indices[middle];

//     let border = secondary ? middle + 1 : middle - 1;
//     let borderIndex = indices[border];

//     let middleCheck = filter(middleIndex);
//     let borderCheck = filter(borderIndex);

//     if (!secondary && middleCheck == Filter.VALID && extentHigh == null) {
//       extentHigh = high;
//     }

//     if (middleCheck == Filter.VALID) {
//       if (borderCheck != Filter.VALID) {
//         if (secondary) {
//           return middle;

//         } else {
//           const maximum: number | null = search(indices, filter, true, middle, extentHigh) as number | null;

//           return filterSplice(indices, middle, maximum == null ? extentHigh : maximum);
//         }

//       } else {
//         if (secondary) low = middle + 1;
//         else {
//           high = middle;

//           if (extentHigh == null) extentHigh = high;
//         }
//       }

//     } else if (middleCheck == Filter.LESS) {
//       low = middle + 1;

//     } else {
//       high = middle;
//     }
//   }

//   if (secondary) return null;
//   else return new Uint32Array(0);
// }

// function searchTest(indices: Uint32Array, filter: FilterCallback, minimum: boolean) {
//   let low: number = 0;
//   let high: number = indices.length - 1;

//   while (low < high) {
//     const middle = floor((low + high) / 2);
//     const result = filter(indices[middle]);

//     if (minimum && result == Filter.LESS) low = middle + 1;
//     else high = middle - 1;
//   }
// }

// function binarySearchNumberTest(arr: Uint32Array, data: number[], val: number, isFindingLower: boolean): number {
//   let low: number = 0;
//   let high: number = arr.length - 1;
//   let mid: number = 0;
//   if (isFindingLower) {
//     while (low < high) {
//       mid = floor((low + high) / 2);
//       if (data[arr[mid]] < val) low = mid + 1;
//       else high = mid;
//     }
//   } else {
//     while (low < high) {
//       mid = floor((low + high + 1) / 2);
//       if (data[arr[mid]] > val) high = mid - 1;
//       else low = mid;
//     }
//   }
//   return low;
// }

// function binarySearchNumberRangeTest(arr: Uint32Array, data: number[], range: number[]): number[] {
//   // we assume the input is [lower, upper]
//   return [binarySearchNumberTest(arr, data, range[0], true), binarySearchNumberTest(arr, data, range[1], false)]
// }

function filterNumbers(data: number[], sortedIndices: Uint32Array, min: number, max: number): Uint32Array {
  return getFiltered(sortedIndices, (i: number) => {
    let value = data[i];

    if (value >= min && value <= max) return Filter.VALID;
    else if (value > max) return Filter.MORE;
    else return Filter.LESS;
  }) as Uint32Array;
}

function filterStrings(data: string[], sortedIndices: Uint32Array, searchInput: string): Uint32Array {
  const len = searchInput.length;

  return getFiltered(sortedIndices, (index: number) => {
    const value = data[index];
    const vLen = value.length;
    const comparison = value.localeCompare(searchInput);

    if (comparison == 0) return Filter.VALID;

    for (let i = 0; i < len; i++) {
      if (i >= vLen || value[i].toLowerCase() != searchInput[i].toLowerCase()) {
        const comparison = value.localeCompare(searchInput);

        if (comparison > 0) return Filter.MORE;
        else return Filter.LESS;
      }
    }

    return Filter.VALID;
  }) as Uint32Array;
}

function testBinaryS(arr: number[], goal: number, lower: boolean) {
  let low = 0;
  let high = arr.length - 1;

  while (low < high) {
    const middle = lower ? floor((low + high) / 2) : floor((low + high + 1) / 2);
    const value = arr[middle];

    console.log(low, high, middle);

    if (lower) {
      if (value < goal) low = middle + 1;
      else high = middle;
    } else {
      if (value > goal) high = middle - 1;
      else low = middle;
    }
  }

  console.log(arr, low);
}

// testBinaryS([1,1,1,2,2,2,3,3,4,4,4,5,5], 5, false);

let testData: number[] = new Array(100000);
let testIndices = new Uint32Array(100000);
for (let i = 0; i < 100000; i++) {
  testData[i] = i + 1;
  testIndices[i] = i;
}

let searchInput = "h";
let t = 3;

let res = filterNumbers(testData, testIndices, 5, 100);

console.log(testData, res);