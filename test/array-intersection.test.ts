import binarySearch from './../src/scripts/algorithms/binary-search'; // Adjust the import based on your file structure

describe('binarySearch', () => {
  // Example filter callback for testing
  const filter = (value) => {
    if (value < 5) return -1;  // Should be searched to the right
    if (value > 5) return 1;   // Should be searched to the left
    return 0;                  // Found the target
  };

  test('should find the index of the target value (isMaximum: false)', () => {
    const indices = new Uint32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const result = binarySearch(indices, filter, false);
    expect(result).toBe(4);  // Index of the first 5
  });

  test('should find the index of the target value (isMaximum: true)', () => {
    const indices = new Uint32Array([1, 2, 3, 4, 5, 5, 6, 7, 8, 9]);
    const result = binarySearch(indices, filter, true);
    expect(result).toBe(5);  // Index of the last 5
  });

  test('should return -1 if the target value is not found', () => {
    const indices = new Uint32Array([1, 2, 3, 4, 6, 7, 8, 9]);
    const result = binarySearch(indices, filter, false);
    expect(result).toBe(-1); // 5 is not in the array
  });

  test('should return -1 if the target value is not found (isMaximum: true)', () => {
    const indices = new Uint32Array([1, 2, 3, 4, 6, 7, 8, 9]);
    const result = binarySearch(indices, filter, true);
    expect(result).toBe(-1); // 5 is not in the array
  });

  test('should handle an empty array', () => {
    const indices = new Uint32Array([]);
    const result = binarySearch(indices, filter, false);
    expect(result).toBe(-1); // No elements to search
  });

  test('should handle an array with one element (not found)', () => {
    const indices = new Uint32Array([10]);
    const result = binarySearch(indices, filter, false);
    expect(result).toBe(-1); // 5 is not found in [10]
  });

  test('should handle an array with one element (found)', () => {
    const indices = new Uint32Array([5]);
    const result = binarySearch(indices, filter, false);
    expect(result).toBe(0); // Found at index 0
  });
});
