export function floor(val: number): number {
  if ((val * 10) % 10 === 5){
    return val - 0.5;
  }
  return val;
}
export function slice<T>(arr: T[], start: number, end?: number): T[] {
  if (end === undefined) {
    end = arr.length;
  }
  let outPut: T[] = [];
  for (let i = start; i < end; i++) {
    outPut.push(arr[i]);
  }
  return outPut;
}
export function getMax(a: number, b: number): number {
  return a < b ? b : a;
}
export function getMin(a: number, b: number): number {
  return a > b ? b : a;
}
