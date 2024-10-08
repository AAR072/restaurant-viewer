import { insertToNumberTree } from "./scripts/structs/bst";
//TEMP CODE FOR TESTING 
import { readFileSync } from 'fs';
// Load JSON text from server hosted file and return JSON parsed object
function loadJSON(filePath: string): any {
  // Load json file;
  const json: string | null = readFileSync(filePath, 'utf8');

  if (json) {
    // Parse json
    return JSON.parse(json);
  }
  return null;
}

//Don't remove this
export interface Data {
  ID: string[];
  storeName: string[];
  type: string[];
  cost: number[];
  review: number[];
  x: number[];
  y: number[];
}


export const data: Data = loadJSON("../DO_NOT_TOUCH/data.json") as Data; //Don't delete this line. All your data is here. It does take a few seconds for Replit to load the data because it's so large.

// Creating unbalanced BSTs for all numerical params

// const xBST: number [] = [];
// const yBST: number [] = [];
// const costBST: number []= [];
// const reviewBST: number [] = [];
// let t0 = performance.now()
// for (let i = 0; i < data.x.length; i++){
//   insertToNumberTree(xBST, data.x[i]);
//   insertToNumberTree(yBST, data.y[i]);
//   insertToNumberTree(costBST, data.cost[i]);
//   insertToNumberTree(reviewBST, data.review[i]);
// }
let root: number [] = new Array(50)
insertToNumberTree(root, 3);
console.log(root)
insertToNumberTree(root, 2);
console.log(root)
insertToNumberTree(root, 4);
console.log(root)
insertToNumberTree(root, 1);
console.log(root)
console.log(insertToNumberTree(root, 5));
// let root: number [] = [];
// console.log(data.x[0]);
// console.log(data.x[2]);
// console.log(data.x[44]);
// insertToNumberTree(root, data.x[0]);
// insertToNumberTree(root, data.x[2]);
// console.log(insertToNumberTree(root, data.x[44]));





