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
sorted.cost = sortNumbers(data.cost);

let t2 = performance.now();
const filtered = filterNumbers(data.review, sorted.review, 4, 5);

let t3 = performance.now();
const filtered2 = filterNumbers(data.cost, sorted.cost, 0, 10);

let t4 = performance.now();
const intersections = getIntersections([filtered, filtered2]);

let t5 = performance.now();
const resorted = sortBy(intersections, sorted.storeName);
let t6 = performance.now();

console.log("Sort performance:", t2 - t1);
console.log("Search performance 1:", t3 - t2);
console.log("Search performance 2:", t4 - t3);
console.log("Intersection performance:", t5 - t4);
console.log("Resort performance:", t6 - t5);

function printStuff(reference: any[], indices: Uint32Array | number[]) {
  let p = new Array(indices.length);

  for (let i = 0; i < indices.length; i++) {
    p[i] = reference[indices[i]];
  }

  console.log(p);
}

printStuff(data.review, sorted.review);
printStuff(data.cost, sorted.cost);
printStuff(data.review, filtered);
printStuff(data.cost, filtered2);
printStuff(data.review, intersections);
printStuff(data.storeName, resorted);