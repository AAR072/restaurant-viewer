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

const data: Data = loadJSON('DO_NOT_TOUCH/data.json') as Data; // Load data from JSON file.

const app: App = new App(data); // Create app instance
