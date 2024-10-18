interface Data {
  ID: string[];
  storeName: string[];
  type: string[];
  cost: number[];
  review: number[];
  x: number[];
  y: number[];
}

interface SortedData {
  ID: Uint32Array;
  storeName: Uint32Array;
  type: {[key: string]: number[]};
  cost: Uint32Array;
  review: Uint32Array;
  x: Uint32Array;
  y: Uint32Array;
}

interface SortMap {

}

type SortDataField = "storeName" | "cost" | "review";

const data: Data = loadJSON("DO_NOT_TOUCH/data.json") as Data;

const sorted: SortedData = {
  ID: sortStrings(data.ID),
  storeName: sortStrings(data.storeName),
  type: {},
  cost: sortNumbers(data.cost),
  review: sortNumbers(data.review),
  x: sortNumbers(data.x),
  y: sortNumbers(data.y)
}

class Sorter {
  // do sort methods here and log/display them
}

class App {
  public data: Data;
  public sorted: SortedData;
  public sortMap: SortMap;

  public locationX: number = 0;
  public locationY: number = 0;
  public distance: Float32Array = new Float32Array(100000);
  public sortedDistance: Uint32Array;

  constructor(data: Data) {
    this.data = data;

    this.sorted = {
      ID: sortStrings(data.ID),
      storeName: sortStrings(data.storeName),
      type: {},
      cost: sortNumbers(data.cost),
      review: sortNumbers(data.review),
      x: sortNumbers(data.x),
      y: sortNumbers(data.y)
    };

    this.sortMap = {
      storeName: getOrderMap(this.sorted.storeName)
    };

    let t1 = performance.now();
    let test = getOrderMap(this.sorted.cost);
    let t2 = performance.now();
    console.log("ORDER MAP PERFORMANCE", t2 - t1);

    this.updateDistance();
  }

  updateDistance() {
    for (let i = 0; i < 100000; i++) {
      const xDist = this.locationX - data.x[i];
      const yDist = this.locationY - data.y[i];

      this.distance[i] = Math.sqrt(xDist**2 + yDist**2);
    }

    console.log(this.data.x, this.data.y, this.distance);

    this.sortedDistance = sortNumbers(this.distance);
  }

  changeLocation(x: number, y: number) {
    this.locationX = x;
    this.locationY = y;

    this.updateDistance();
  }
}

new App(data);

const id_search_input = document.getElementById("id-search-input") as HTMLInputElement;
const id_search_button = document.getElementById("id-search-button") as HTMLButtonElement;
const name_search_input = document.getElementById("name-search-input") as HTMLInputElement;
const name_search_button = document.getElementById("name-search-button") as HTMLButtonElement;
const x_search_input = document.getElementById("x-search-input") as HTMLInputElement;
const y_search_input = document.getElementById("y-search-input") as HTMLInputElement;
const xy_search_button = document.getElementById("xy-search-button") as HTMLButtonElement;

const page_size_input = document.getElementById("page-size") as HTMLInputElement;
const next_page_button = document.getElementById("next-page") as HTMLButtonElement;
const prev_page_button = document.getElementById("prev-page") as HTMLButtonElement;
const page_number_input = document.getElementById("page-number-input") as HTMLInputElement;
const page_count = document.getElementById("page-count") as HTMLSpanElement;

const search_order = document.getElementById("search-results-order") as HTMLButtonElement;
const search_results = document.getElementById("search-results") as HTMLDivElement;

function createResInfoElement(order: number, index: number) {
  const div = document.createElement("div");
  const p = document.createElement("p");

  p.innerText = `
  Result #${order + 1}\n
  ID: ${data.ID[index]}\n
  Name: ${data.storeName[index]}\n
  Type: ${data.type[index]}\n
  Cost: ${data.cost[index]}\n
  Review: ${data.review[index]}\n
  Position: (${data.x[index]}, ${data.y[index]})
  `;

  div.appendChild(p);
  search_results.appendChild(div);
}

class SearchResult {
  static pageSize: number = 10;

  public results: Uint32Array;
  public resultCount: number;
  public sorted: Uint32Array;
  public defaultSort: string;
  public page: number = 0;
  public pageCount: number;
  public descending: boolean = false;

  constructor(results: Uint32Array, defaultSort: string) {
    this.results = results;
    this.resultCount = results.length;
    this.defaultSort = defaultSort;
    this.pageCount = Math.ceil(this.resultCount/SearchResult.pageSize);
    this.loadPageInfo();
    this.loadResults();
  }

  changePageSize(n: number) {
    n = clamp(n, 1, 100);

    if (n == SearchResult.pageSize) return;

    SearchResult.pageSize = n;
    this.page = 0;
    this.pageCount = Math.ceil(this.resultCount/SearchResult.pageSize);

    this.loadPageInfo();
    this.loadResults();
  }

  loadPageInfo() {
    page_size_input.value = String(SearchResult.pageSize);
    page_number_input.value = String(this.page + 1);
    page_count.innerText = String(this.pageCount == 0 ? 1 : this.pageCount);
  }

  loadResults() {
    search_order.innerText = this.descending ? "Descending" : "Ascending";
    search_results.innerHTML = "";

    for (let i = 0; i < SearchResult.pageSize; i++) {
      const change = this.page*SearchResult.pageSize + i;
      const current = this.descending ? this.resultCount - 1 - change : change;
  
      if (current >= this.resultCount || current < 0) break;
  
      createResInfoElement(current, this.results[current]);
    }
  }

  increment(amount: number) {
    this.page = circleMod(this.page + amount, this.pageCount);

    this.loadPageInfo();
    this.loadResults();
  }

  setPage(n: number) {
    n = clamp(n, 0, this.pageCount - 1);

    if (n == this.page) return;

    this.page = n;
    this.loadPageInfo();
    this.loadResults();
  }

  toggleOrder() {
    this.descending = !this.descending;
    this.loadResults();
  }

  sortBy() {

  }
}

let currentSearchResult: SearchResult = new SearchResult(sorted.storeName, "storeName");

/*
possible idea, create "html sort" arrays for each data type
essentially every index is the actual restaurant index and every value is the order index
(reverse of current sorted indices)
then get layout order for info divs through that array
*/

page_size_input.addEventListener("keypress", (event: KeyboardEvent) => {
  if (event.key == "Enter" && currentSearchResult) {
    let input = Number(page_size_input.value);
    
    if (isNaN(input)) return;
    
    currentSearchResult.changePageSize(input);
  }
});

next_page_button.addEventListener("click", () => {
  if (currentSearchResult) currentSearchResult.increment(1);
});

prev_page_button.addEventListener("click", () => {
  if (currentSearchResult) currentSearchResult.increment(-1);
});

page_number_input.addEventListener("keypress", (event: KeyboardEvent) => {
  if (event.key == "Enter" && currentSearchResult) {
    const input = Number(page_number_input.value);

    if (!isNaN(input)) currentSearchResult.setPage(input - 1);
  }
});

search_order.addEventListener("click", () => {
  if (currentSearchResult) currentSearchResult.toggleOrder();
});

id_search_button.addEventListener("click", () => {
  const input = id_search_input.value;

  const results = filterStrings(data.ID, sorted.ID, input);
  const sortedResults = sortBy(results, sorted.storeName);

  currentSearchResult = new SearchResult(sortedResults, "ID");
});

name_search_button.addEventListener("click", () => {
  const input = name_search_input.value;

  const results = filterStrings(data.storeName, sorted.storeName, input);

  currentSearchResult = new SearchResult(results, "storeName");
});

xy_search_button.addEventListener("click", () => {
  const xInput = Number(x_search_input.value);
  const yInput = Number(y_search_input.value);

  if (isNaN(xInput) || isNaN(yInput)) return;

  const xResuslts = filterNumbers(data.x, sorted.x, xInput, xInput);
  const yResults = filterNumbers(data.y, sorted.y, yInput, yInput);
  const finalResults = getIntersections(xResuslts, yResults);

  currentSearchResult = new SearchResult(finalResults, "x");
});

class DisplayMap {

}

let t1 = performance.now();
sorted.cost = sortNumbers(data.cost);
let t2 = performance.now();
// const filtered = filterNumbers(data.review, sorted.review, 4, 5);

// let t3 = performance.now();
// const filtered2 = filterNumbers(data.cost, sorted.cost, 0, 10);

// let t4 = performance.now();
// const intersections = getIntersections([filtered, filtered2]);

// let t5 = performance.now();
// const resorted = sortBy(intersections, sorted.storeName);
// let t6 = performance.now();

console.log("Sort performance:", t2 - t1);
// console.log("Search performance 1:", t3 - t2);
// console.log("Search performance 2:", t4 - t3);
// console.log("Intersection performance:", t5 - t4);
// console.log("Resort performance:", t6 - t5);

function printStuff(reference: any[], indices: Uint32Array | number[]) {
  let p = new Array(indices.length);

  for (let i = 0; i < indices.length; i++) {
    p[i] = reference[indices[i]];
  }

  console.log(p);
}

// printStuff(data.review, sorted.review);
printStuff(data.cost, sorted.cost);
// printStuff(data.review, filtered);
// printStuff(data.cost, filtered2);
// printStuff(data.review, intersections);
// printStuff(data.storeName, resorted);