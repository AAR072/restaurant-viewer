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

let testCheck = document.getElementById("test-checklist") as HTMLDivElement;

new Checklist(
  testCheck,
  ["test1", "test2", "test3", "test4", "test5", "test6", "test7", "test8", "test9", "test10"],
  true, 6
);

const app = new App(data);