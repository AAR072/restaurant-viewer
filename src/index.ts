interface Data {
  ID: string[];
  storeName: string[];
  type: string[];
  cost: number[];
  review: number[];
  x: number[];
  y: number[];
}

interface SortedIndices {
  ID: Uint32Array;
  storeName: Uint32Array;
  typeList: number[];
  type: number[][];
  cost: Uint32Array;
  review: Uint32Array;
  x: Uint32Array;
  y: Uint32Array;
}

const data: Data = loadJSON("DO_NOT_TOUCH/data.json") as Data;

const sorted: SortedIndices = {
  ID: sortStrings(data.ID),
  storeName: sortStrings(data.storeName),
  typeList: [],
  type: [],
  cost: sortNumbers(data.cost),
  review: sortNumbers(data.review),
  x: sortNumbers(data.x),
  y: sortNumbers(data.y)
}

let t1 = performance.now();
const filtered = filterStrings(data.storeName, sorted.storeName, "a");
let t2 = performance.now();

console.log("Performance:", t2 - t1);

function printStuff(reference: any[], indices: Uint32Array) {
  let p = new Array(indices.length);

  for (let i = 0; i < indices.length; i++) {
    p[i] = reference[indices[i]];
  }

  console.log(p);
}

printStuff(data.storeName, filtered);

printStuff(data.storeName, sorted.storeName);