import { sortNumbers, sortStrings } from "./scripts/algorithms/merge-sort";
import { filterNumbers, filterStrings } from "./scripts/algorithms/binary-search";

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

const filtered = filterNumbers(data.x, sorted.x, 2, 2);

function printStuff(reference: any[], indices: Uint32Array) {
  let p = new Array(indices.length);

  for (let i = 0; i < indices.length; i++) {
    p[i] = reference[indices[i]];
  }

  console.log(p);
}

printStuff(data.x, filtered);

console.log(data);