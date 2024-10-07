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

const data: Data = loadJSON("../DO_NOT_TOUCH/data.json") as Data; //Don't delete this line. All your data is here. It does take a few seconds for Replit to load the data because it's so large.

//This below just shows you how to access the data. You can remove these.
console.log(data);
console.log(data.ID);
