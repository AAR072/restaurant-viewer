//Don't remove this
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
  ID: number[];
  storeName: number[];
  typeList: number[];
  type: number[][];
  cost: number[];
  review: number[];
  x: number[];
  y: number[];
}

// store types as an array of existing types and a 2d array for 

const data: Data = loadJSON("DO_NOT_TOUCH/data.json") as Data; //Don't delete this line. All your data is here. It does take a few seconds for Replit to load the data because it's so large.

const sorted = {
  ID: sortStrings(data.ID),
  storeName: sortStrings(data.storeName),
  typeList: [],
  type: [],
  cost: sortNumbers(data.cost),
  review: sortNumbers(data.review),
  x: sortNumbers(data.x),
  y: sortNumbers(data.y)
}

const filteredReviews = filterNumbers(data.review, sorted.review, 4.9, 5) as number[];

function printStuff(reference: any[], indices: number[]) {
  let p = new Array(indices.length);

  for (let i = 0; i < indices.length; i++) {
    p[i] = reference[indices[i]];
  }

  console.log(p);
}

printStuff(data.review, filteredReviews);