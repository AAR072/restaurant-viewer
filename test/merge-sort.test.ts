import { mergeSort } from './../src/scripts/algorithms/merge-sort'; // Adjust the path accordingly

describe('mergeSort', () => {
  test('should sort an array of numbers', () => {
    const input = [4, 2, 5, 1, 3];
    const expectedOutput = [1, 2, 3, 4, 5];
    expect(mergeSort(input)).toEqual(expectedOutput);
  });

  test('should handle an empty array', () => {
    const input: number[] = [];
    const expectedOutput: number[] = [];
    expect(mergeSort(input)).toEqual(expectedOutput);
  });

  test('should handle an array with one element', () => {
    const input = [42];
    const expectedOutput = [42];
    expect(mergeSort(input)).toEqual(expectedOutput);
  });

  test('should sort an array with repeated elements', () => {
    const input = [5, 1, 4, 2, 2, 3, 1];
    const expectedOutput = [1, 1, 2, 2, 3, 4, 5];
    expect(mergeSort(input)).toEqual(expectedOutput);
  });

  test('should sort an array of negative numbers', () => {
    const input = [-1, -3, -2, -5, -4];
    const expectedOutput = [-5, -4, -3, -2, -1];
    expect(mergeSort(input)).toEqual(expectedOutput);
  });

  test('should handle an array of arrays where only element 0 of each array is relevant', () => {
    const input = [[3, 'a'], [1, 'b'], [2, 'c']];
    const expectedOutput = [[1, 'b'], [2, 'c'], [3, 'a']];
    expect(mergeSort(input)).toEqual(expectedOutput);
  });
});

