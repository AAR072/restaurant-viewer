import { data } from "../../index";

enum Compare {
  LESS = -1,
  EQUAL = 0,
  MORE = 1
}

enum Filter {
  INVALID = -1,
  VALID = 0,
  DOWN = 1,
  UP = 2,
}

type CompareCallback = (a: number, b: number) => Compare

type FilterCallback = (a: number) => Filter

function floor(n: number) {
  return n - n % 1;
}

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

function sortArray<T>(arr: T[], compare: CompareCallback) {
  const length = arr.length;
  const sorted = new Array(length);

  sort(sorted, 0, length - 1, compare);

  return sorted;
}

function sortNumbers(arr: number[]) {
  return sortArray<number>(arr, (a: number, b: number) => {
    const aVal = arr[a];
    const bVal = arr[b];
  
    if (aVal > bVal) return Compare.MORE;
    else if (aVal < bVal) return Compare.LESS;
    else return Compare.EQUAL;
  });
}

function sortStrings(arr: string[]) {
  return sortArray<string>(arr, (a: number, b: number) => {
    const difference = arr[a].localeCompare(arr[b]);
  
    if (difference > 0) return Compare.MORE;
    else if (difference < 0) return Compare.LESS;
    else return Compare.EQUAL;
  });
}

// Searching

// function searchOld<T>(arr: T[], filter: FilterCallback): number[] {
//   let length = floor(arr.length/2);
//   let pointer = length;
//   let results: number[] = [];
//   let resultPointer = 0;

//   while (true) {
//     let middle = arr[pointer];
//     let check = filter(middle);

//     if (check == Filter.VALID) {
//       results.push(pointer);

//       for (let i = 1; i <= length; i++) {
//         let index = pointer + i;
//         let v = arr[index];

//         if (filter(v) != Filter.VALID) {
//           break;
//         }

//         results.push(index);
//       }

//       for (let i = 1; i <= length; i++) {
//         let index = pointer - i;
//         let v = arr[index];

//         if (filter(v) != Filter.VALID) {
//           break;
//         }

//         results.push(index);
//       }

//       break;
//     }

//     length = floor(length/2);

//     if (length <= 1) {
//       length = 1;
//     }

//     if (check == Filter.UP) {
//       pointer += length;

//     } else if (check == Filter.DOWN) {
//       pointer -= length;
//     }
//   }

//   return results;
// }

function searchScan(indices: number[], found: number, low: number, high: number, filter: FilterCallback) {
  let incrementLow = floor((found - low + 1)**0.5);
  let lowStart = found - 1;
  let incrementsLow = 0;

  let incrementHigh = floor((high - found + 1)**0.5);
  let highStart = found + 1;
  let incrementsHigh = 0;

  let extentLow = found;
  let extentHigh = found;
  
  while (true) {
    let lowIndex = lowStart - incrementsLow*incrementLow;

    if (lowIndex < low || filter(indices[lowIndex]) != Filter.VALID) {
      if (incrementLow <= 1) {
        extentLow = lowIndex + 1;

      } else {
        let start = lowIndex + incrementLow;
        if (start > lowStart) start = lowStart;

        let end = lowIndex;
        if (end < low) end = low;

        for (let i = start; i >= end; i--) {
          if (filter(indices[lowIndex]) != Filter.VALID) {
            extentLow = i + 1;
          }
        }
      }

      break;
    }

    incrementsLow++;
  }

  while (true) {
    let highIndex = highStart + incrementsHigh*incrementHigh;

    if (highIndex > high || filter(indices[highIndex]) != Filter.VALID) {
      if (incrementLow <= 1) {
        extentLow = highIndex - 1;

      } else {
        let start = highIndex - incrementHigh;
        if (start < highStart) start = highStart;

        let end = highIndex;
        if (end > high) end = high;

        for (let i = start; i <= end; i++) {
          if (filter(indices[highIndex]) != Filter.VALID) {
            extentHigh = i - 1;
          }
        }
      }

      break;
    }

    incrementsHigh++;
  }

  const length = extentHigh - extentLow + 1;

  console.log(extentLow, found, extentHigh);

  let pointer = 0;
  let results = new Array(length);

  for (let i = 0; i < length; i++) {

  }
}

searchScan([1, 2, 3, 4, 5, 6, 7, 8, 9], 6, 0, 10, (a: number) => {
  if (a >= 3 && a <= 8) return Filter.VALID;
  else if (a > 3) return Filter.DOWN;
  else if (a < 8) return Filter.UP;
  else return Filter.INVALID;
});

function search(indices: number[], filter: FilterCallback): number | void {
  let low = 0;
  let high = indices.length - 1;

  while (low < high) {
    let middle = floor(low + (high - low)/2);
    let middleIndex = indices[middle];
    let middleCheck = filter(middleIndex);

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

let sorted = sortNumbers(data.cost);
let found = search(sorted, (a: number) => {
  let value = data.cost[a];

  if (value >= 200 && value <= 210) return Filter.VALID;
  else if (value > 210) return Filter.DOWN;
  else if (value < 200) return Filter.UP;
  else return Filter.INVALID;
});
// if (found) console.log(found, data.cost[found]);


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


function consoleLog<T>(reference: T[], indices: number[]) {
  let print = [];
  for (let i = 0; i < indices.length; i++) {
    print[i] = reference[indices[i]];
  }
  console.log(print);
}
// consoleLog(data.storeName, sorted);