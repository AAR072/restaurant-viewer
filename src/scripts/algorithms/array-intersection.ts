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