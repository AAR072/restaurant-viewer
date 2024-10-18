function floor(n: number) {
  return n - n % 1;
}

function circleMod(n: number, base: number) {
  n %= base;

  return n < 0 ? n + base : n;
}

function clamp(n: number, min: number, max: number) {
  if (n < min) n = min;
  if (n > max) n = max;

  return n;
}

function getMax(a: number, b: number): number {
  return a < b ? b : a;
}

function getMin(a: number, b: number): number {
  return a > b ? b : a;
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
