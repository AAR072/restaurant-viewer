class HashTable {
  constructor(
    public size: number,
    public arr: Uint32Array = new Uint32Array(size)
  ) {}

  set(key: number, value: number) {
    if (key > this.size) this.resize(key);

    this.arr[key] = value;
  }

  resize(newSize: number) {
    const newArray = new Uint32Array(newSize);
    newArray.set(this.arr);

    this.size = newSize;
    this.arr = newArray; 
  }
}

function getIntersections(...data: Uint32Array[]): Uint32Array {
  const dataSetCount = data.length;
  const requiredCount = dataSetCount - 1;

  const firstSet = data[0];
  const firstLength = firstSet.length;

  const hashTable = new Array(100000);

  for (let i = 1; i < dataSetCount; i++) {
    const dataSet = data[i];
    const setLength = dataSet.length;

    for (let j = 0; j < setLength; j++) {
      const value = dataSet[j];

      if (!hashTable[value]) hashTable[value] = 1;
      else hashTable[value]++;
    }
  }

  const duplicates: number[] = [];
  let dupePointer = 0;

  for (let i = 0; i < firstLength; i++) {
    const value = firstSet[i];

    if (hashTable[value] == requiredCount) {
      duplicates[dupePointer++] = value;
    }
  }

  return new Uint32Array(duplicates);
}

// Sorts array of indices based on order of given sorted indices array
function sortBy(indices: Uint32Array, sortedIndices: Uint32Array): Uint32Array {
  const length = indices.length;
  const existing: boolean[] = [];

  for (let i = 0; i < length; i++) {
    existing[indices[i]] = true;
  }

  const sorted = new Uint32Array(length);
  let sortedPointer = 0;
  
  for (let i = 0; i < 100000; i++) {
    const value = sortedIndices[i];

    if (existing[value]) sorted[sortedPointer++] = value;
  }

  return sorted;
}