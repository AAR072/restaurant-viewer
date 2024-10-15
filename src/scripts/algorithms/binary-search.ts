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

function aliIntersection(...input: number[][]): number[]{
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
  const first = input[0]
  for(let i = 0; i < first.length; i++){
    let v = first[i];
    if(hashTable[v] === target){
      output[outputPtr] = v;
      outputPtr++;
    }
  }
  return output;
}

function shittyIntersection(...data: number[][]): number[] {
  const dataSetCount = data.length;
  const baseData = data[0];
  const baseLength = baseData.length;

  const hashTable: number[] = [];

  const duplicates = [];
  let dupePointer = 0;

  for (let i = 0; i < dataSetCount; i++){
    for (let j = 1; j < data[i].length; j++) {
      if (data[i][j] == null) data[i][j] = 1;
      else data[i][j]++;
    }
  }


  const target = dataSetCount - 1;

  for (let i = 0; i < baseLength; i++) {
    const value = baseData[i];

    if (hashTable[value] === target){
      duplicates[dupePointer] = i;
      dupePointer++;
    }
  }

  return duplicates;
}

function sebIntersection(...data: number[][]): number[] {
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
console.log(aliIntersection(
  [45, 46, 47],
  [46, 47, 48],
  [33, 22, 46]
));
let t22 = performance.now();
console.log("Performance 1 ^^^", t22 - t11);