import { storeSearch } from "./scripts/algorithms/store-search";
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

const data: Data = loadJSON("../DO_NOT_TOUCH/data.json") as Data; //Don't delete this line. All your data is here. It does take a few seconds for Replit to load the data because it's so large.

console.log(storeSearch(data, undefined, "Bistro / Rustic", undefined, undefined))
