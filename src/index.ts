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

const data: Data = loadJSON("DO_NOT_TOUCH/data.json") as Data; //Don't delete this line. All your data is here. It does take a few seconds for Replit to load the data because it's so large.

const sortedReviews = sortNumbers(data.cost);
const filteredReviews = filterNumbers(data.review, sortedReviews, 4.5, 5) as number[];

const printThing = [];
for (let i = 0; i < sortedReviews.length; i++) {
  printThing[i] = data.cost[sortedReviews[i]];
}
console.log(printThing);

const printThing2 = [];
for (let i = 0; i < filteredReviews.length; i++) {
  printThing2[i] = data.cost[filteredReviews[i]];
}
console.log(printThing2);