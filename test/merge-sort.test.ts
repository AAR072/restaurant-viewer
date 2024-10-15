import { sortNumbers, sortStrings } from './../src/scripts/algorithms/merge-sort';

function convertIndices(reference: any[], indices: Uint32Array) {
  let c = new Array(indices.length);

  for (let i = 0; i < indices.length; i++) {
    c[i] = reference[indices[i]];
  }

  return c;
}

describe('mergeSort', () => {
  test('should sort an array of numbers', () => {
    const input = [4, 2, 5, 1, 3];
    const expectedOutput = [1, 2, 3, 4, 5];
    expect(convertIndices(input, sortNumbers(input))).toEqual(expectedOutput);
  });

  test('should handle an empty array', () => {
    const input: number[] = [];
    const expectedOutput: number[] = [];
    expect(convertIndices(input, sortNumbers(input))).toEqual(expectedOutput);
  });

  test('should handle an array with one element', () => {
    const input = [42];
    const expectedOutput = [42];
    expect(convertIndices(input, sortNumbers(input))).toEqual(expectedOutput);
  });

  test('should sort an array with repeated elements', () => {
    const input = [5, 1, 4, 2, 2, 3, 1];
    const expectedOutput = [1, 1, 2, 2, 3, 4, 5];
    expect(convertIndices(input, sortNumbers(input))).toEqual(expectedOutput);
  });

  test('should sort an array of negative numbers', () => {
    const input = [-1, -3, -2, -5, -4];
    const expectedOutput = [-5, -4, -3, -2, -1];
    expect(convertIndices(input, sortNumbers(input))).toEqual(expectedOutput);
  });

  test('should handle large arrays', () => {
    const randomNumbers = new Array(100000).map((_, i) => 100000 - i);
    const expectedOutput = new Array(100000).map((_, i) => i + 1);
    expect(convertIndices(randomNumbers, sortNumbers(randomNumbers))).toEqual(expectedOutput);
  });

  test('should handle very large arrays', () => {
    const randomNumbers = new Array(1000000).map((_, i) => 1000000 - i);
    const expectedOutput = new Array(1000000).map((_, i) => i + 1);
    expect(convertIndices(randomNumbers, sortNumbers(randomNumbers))).toEqual(expectedOutput);
  });
});