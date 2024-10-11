import { data, Data } from "../../index";

console.log(data);

const exampleData = [1, 2, 2, 3, 3, 3, 4, 5, 5, 6, 7, 8, 9, 9, 9, 10, 10, 11];

function round(n: number): number {
  return n - n % 1;
}

export function binarySearch(arr: number[], min: number, max: number): number[] {
  let length = round(arr.length/2);
  let pointer = length;
  let results: number[] = [];
  let resultPointer = 0;

  while (true) {
    let middle = arr[pointer];

    if (middle >= min && middle <= max) {
      results.push(pointer);

      for (let i = 1; i <= length; i++) {
        let index = pointer + i;
        let v = arr[index];

        if (v < min || v > max) {
          break;
        }

        results.push(index);
      }

      for (let i = 1; i <= length; i++) {
        let index = pointer - i;
        let v = arr[index];

        if (v < min || v > max) {
          break;
        }

        results.push(index);
      }

      break;
    }

    length = round(length/2);

    if (length <= 1) {
      length = 1;
    }

    if (min > middle && max > middle) {
      pointer += length;

    } else if (min < middle && max < middle) {
      pointer -= length;
    }
  }

  return results;
}

let testData: number[] = [];
let currentVal = 0;
for (let i = 0; i < 100000; i++) {
  testData[i] = currentVal;

  if (Math.random() < 0.25) currentVal++;
}

console.log(testData);

let t = performance.now();
let filtered = binarySearch(testData, 10, 12);
console.log(performance.now() - t);

for (let i = 0; i < filtered.length; i++) {
  console.log(i, filtered[i], testData[filtered[i]]);
}