// import { slice, floor } from "../util/utils";
console.log("jjj")
// TODO: Make slice even faster
// This code is adapted from https://mike.ma/ICS4U/unit_1_data_structures_and_algorithms/3._algorithms/3.4._merge_sort
export function mergeNumber<T>(left: T[][], right: T[][], arr: T[][]): T[][] {
  let i = 0;
  let j = 0;

  for (let k = 0; k < arr.length; k++) {
    if (i >= left.length) {
      //If left is empty
      arr[k] = right[j]; //Dump in the values from right
      j++;
    } else if (j >= right.length) {
      //If right is empty
      arr[k] = left[i]; //Dump in the values from left
      i++;
    } else if (left[i][0] < right[j][0]) {
      arr[k] = left[i];
      i++;
    } else {
      arr[k] = right[j];
      j++;
    }
  }

  return arr;
}
export function mergeString(left: string[][], right: string[][], arr: string[][]): string[][] {
  let i = 0;
  let j = 0;

  for (let k = 0; k < arr.length; k++) {
    if (i >= left.length) {
      //If left is empty
      arr[k] = right[j]; //Dump in the values from right
      j++;
    } else if (j >= right.length) {
      //If right is empty
      arr[k] = left[i]; //Dump in the values from left
      i++;
    } else if (left[i][0].localeCompare(right[j][0]) < 0) {
      arr[k] = left[i];
      i++;
    } else {
      arr[k] = right[j];
      j++;
    }
  }

  return arr;
}
export function mergeSortNumber<T>(arr: T[][]): T[][] {
  //Base case
  if (arr.length <= 1) {
    return arr;
  }

  //Divide!
  let mid: number = floor(arr.length / 2)
  // This slice is not the fastest way
  let left: T[][] = slice(arr,0, mid); //First half
  let right: T[][] = slice(arr, mid); //Second half

  //Conquer!
  left = mergeSortNumber(left);
  right = mergeSortNumber(right);

  //Combine!
  return mergeNumber(left, right, arr);
}
export function mergeSortString (arr: string[][]): string[][] {
  //Base case
  if (arr.length <= 1) {
    return arr;
  }

  //Divide!
  let mid: number = floor(arr.length / 2)
  // This slice is not the fastest way
  let left: string[][] = slice(arr,0, mid); //First half
  let right: string[][] = slice(arr, mid); //Second half

  //Conquer!
  left = mergeSortString(left);
  right = mergeSortString(right);

  //Combine!
  return mergeString(left, right, arr);
}
console.log("asdf")
let joe = [["apple"],["banana"], ["cherry"]]
console.log(mergeSortString(joe));
