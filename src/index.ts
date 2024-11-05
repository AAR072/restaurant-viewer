// Our input database which is used when initializing our data
interface Data {
  ID: string[];
  storeName: string[];
  type: string[];
  cost: number[];
  review: number[];
  x: number[];
  y: number[];
}

const data: Data = loadJSON("DO_NOT_TOUCH/data.json") as Data; // Load data from JSON file.

let testCheck = new Checklist(document.getElementById("test-checklist") as HTMLDivElement, true);
for (let i = 0; i < 10; i++) {
  testCheck.addOption("option" + i, false, "Option " + i);
}
testCheck.addListener((output) => {
  console.log(output);
});

const app = new App(data);