export function floor(n: number) {
  return n - n % 1;
}

function slice<T>(arr: T[], start: number, end?: number): T[] {
  if (end === undefined) {
    end = arr.length;
  }
  let outPut: T[] = [];
  for (let i = start; i < end; i++) {
    outPut.push(arr[i]);
  }
  return outPut;
}

function getMax(a: number, b: number): number {
  return a < b ? b : a;
}

function getMin(a: number, b: number): number {
  return a > b ? b : a;
}
