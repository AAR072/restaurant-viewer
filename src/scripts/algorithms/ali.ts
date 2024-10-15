// THIS CODE WILL CAUSE THE PROGRAM TO ERROR IF YOU RUN LIVE SERVER. WE WILL DELETE THIS IMMEDIATELY AFTER PLAYING AROUND WITH IT
enum Compare {
  LESS = -1,
  EQUAL = 0,
  MORE = 1
}
function floor(n: number) {
  return n - n % 1;
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
import { readFileSync } from 'fs';
import { getLineAndCharacterOfPosition } from 'typescript';
function loadJSON(filePath: string): any {
  // Load json file;
  const json: string | null = readFileSync(filePath, 'utf8');

  if (json) {
    // Parse json
    return JSON.parse(json);
  }
  return null;
}

//Don't remove this
export interface Data {
  ID: string[];
  storeName: string[];
  type: string[];
  cost: number[];
  review: number[];
  x: number[];
  y: number[];
}


const data: Data = loadJSON("./DO_NOT_TOUCH/data.json") as Data; //Don't delete this line. All your data is here. It does take a few seconds for Replit to load the data because it's so large
// RUN THIS FILE WITH TS-NODE ONLY
function filterSplice(indices: number[], min: number, max: number): number[] {
  const length = max - min + 1;
  const results = new Array(length);

  for (let i = 0; i < length; i++) {
    results[i] = indices[min + i];
  }

  return results;
}
// END OF PROBLEMATIC CODE
function binarySearchNumber(arr: number[], data: number [], val: number, isFindingLower: boolean ): number {
  let low: number = 0;
  let high: number = arr.length - 1;
  let mid: number = 0;
  if (isFindingLower) {
    while (low < high) {
      mid = floor((low + high) / 2);
      if (data[arr[mid]] < val) low = mid + 1;
      else high = mid;
    }
  } else {
    while (low < high) {
      mid = floor((low + high + 1) / 2);
      if (data[arr[mid]] > val) high = mid - 1;
      else low = mid;
    }
  }
  return low;
}
function binarySearchString(arr: number[], data: string [], val: string, isFindingLower: boolean ): number {
  let low: number = 0;
  let high: number = arr.length - 1;
  let mid: number = 0;
  if (isFindingLower) {
    while (low < high) {
      mid = floor((low + high) / 2);
      if (data[arr[mid]].localeCompare(val) < 0) low = mid + 1;
      else high = mid;
    }
  } else {
    while (low < high) {
      mid = floor((low + high + 1) / 2);
      if (data[arr[mid]] > val) high = mid - 1;
      else low = mid;
    }
  }
  return low;
}
function binarySearchNumberRange(arr: number[], data: number [], range: number []): number []{
  // we assume the input is [lower, upper]
  return [binarySearchNumber(arr, data, range[0], true), binarySearchNumber(arr, data, range[1], false)]
}
function binarySearchStringRange(arr: number[], data: string [], range: string []): number []{
  // we assume the input is [lower, upper]
  return [binarySearchString(arr, data, range[0], true), binarySearchString(arr, data, range[1], false)]
}

// // our sorted array that holds indices
// let testSORTED = [3,0,1,2,4]
// // our original data
// let testDATA = [2,3,4,1,4];
// // get range of values for 2 <= x <= 4
// let out = binarySearchNumberRange(testSORTED, testDATA, [2,4])
// // returns [1,4] which is [index of leftmost 2, index of rightmost 4]
// console.log(filterSplice(testSORTED, out[0], out[1]))
// // this should output [the indicies data but all in range]

// // we can create another version for strings

// // then to filter by multiple stuff, we do this multiple times, then check which numbers are common in every array, then ouput just those numbers.

// // lets run it on our data now;
// const t0 = performance.now()
// let sortedXVals = sortNumbers(data.x)
// const t1 = performance.now()
// let joeout = binarySearchNumberRange(sortedXVals, data.x, [0,0])
// let spliced = filterSplice(sortedXVals, joeout[0], joeout[1]);
// const t2 = performance.now()
// console.log(`It took ${t1-t0}MS to sort the array, ${t2-t1}MS to search and splice. The output is:`)
// console.log(spliced)

// // interface SortedIndicesButNormal {
//   ID: number[];
//   storeName: number[];
//   typeList: number[];
//   type: number[][];
//   cost: number[];
//   review: number[];
//   x: number[];
//   y: number[];
// }
// let sortedDATA: SortedIndicesButNormal = {
//   ID: sortStrings(data.ID),
//   storeName: sortStrings(data.storeName),
//   type: sortStrings(data.type),
//   cost: [],
//   review: [],
//   x: [],
//   y: []
// };
// sortedDATA.type =
// sortedDATA.push(sortStrings(data.cost));
function storeSearch(
  data: Data, 
  searchID: string | undefined = undefined, 
  searchName: string | undefined = undefined,
  searchXPos: number | undefined = undefined,
  searchYPos: number | undefined = undefined,
  searchType: string | undefined = undefined,
  searchPrice: number [] | undefined = undefined, 
  searchReview: number [] | undefined = undefined,

): Data {
  let t0 = performance.now();
  let startPointer = 0;
  let outputData: Data = {
    ID: [],
    storeName: [],
    type: [],
    cost: [],
    review: [],
    x: [],
    y: []
  };

  // loop through our array, and find all values that match. We will put those in our output array

  let t1 = performance.now();
  console.log(t1 - t0);
  return outputData; 
}

function getIntersection(input: number[][]): number[]{
  let hashTable: number [] = [];
  let outputPtr = 0;
  let output: number [] = [];
  for (let i = 0; i < input.length; i++){
    for (let j = 0; j < input[i].length; j++){
     if(hashTable[input[i][j]] === undefined){
        hashTable[input[i][j]] = 1;
        continue;
      } 
        hashTable[input[i][j]]++;
    }
  }
  const target = input.length;
  for(let i = 0; i < input[0].length; i++){

    if(hashTable[i] === target){
      output[outputPtr] = i;
      outputPtr++;
    }
  }
  return output;
}
console.log(getIntersection([
  [1,2,3],
  [0,1,2],
  [1,4,5]
]));



function hasMatchingParams(currentParam: string | number | undefined, targetParam: string | number | undefined): boolean{
  if (targetParam === undefined){
    return true;
  }
  if (currentParam === targetParam){
    return true;
  }
  return false;
}

function hasMatchingRange(currentValue: number, targetRange: number [] | undefined): boolean{
  if (targetRange === undefined){
    return true;
  }
  if (currentValue >= targetRange[0] && currentValue <= targetRange[1] ){
    return true;
  }
  return false;
}
