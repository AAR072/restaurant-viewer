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
  type: {[key: string]: number[]};
  cost: Uint32Array;
  review: Uint32Array;
  x: Uint32Array;
  y: Uint32Array;
}

const data: Data = loadJSON("DO_NOT_TOUCH/data.json") as Data;

const sorted: SortedIndices = {
  ID: sortStrings(data.ID),
  storeName: sortStrings(data.storeName),
  type: {},
  cost: sortNumbers(data.cost),
  review: sortNumbers(data.review),
  x: sortNumbers(data.x),
  y: sortNumbers(data.y)
}

const search_results = document.getElementById("search-results") as HTMLDivElement;
const id_search_input = document.getElementById("id-search-input") as HTMLInputElement;
const id_search_button = document.getElementById("id-search-button") as HTMLButtonElement;
const name_search_input = document.getElementById("name-search-input") as HTMLInputElement;
const name_search_button = document.getElementById("name-search-button") as HTMLButtonElement;
const x_search_input = document.getElementById("x-search-input") as HTMLInputElement;
const y_search_input = document.getElementById("y-search-input") as HTMLInputElement;
const xy_search_button = document.getElementById("xy-search-button") as HTMLButtonElement;

const next_page_button = document.getElementById("next-page") as HTMLButtonElement;
const prev_page_button = document.getElementById("prev-page") as HTMLButtonElement;

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
  public page: number = 0;
  public pageSize: number = 10;

  constructor(
    public results: Uint32Array,
    public resultCount: number = results.length
  ) {
    this.load();
  }

  load() {
    search_results.innerHTML = "";

    for (let i = 0; i < this.pageSize; i++) {
      const current = this.page*this.pageSize + i;
  
      if (current >= this.resultCount) break;
  
      createResInfoElement(current, this.results[current]);
    }
  }

  getPageCount() {
    return (this.resultCount - this.resultCount % this.pageSize)/this.pageSize;
  }

  nextPage() {
    if (this.page < this.getPageCount()) {
      this.page++;
      this.load();
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.load();
    }
  }
}

let currentSearchResult: SearchResult

/*
possible idea, create "html sort" arrays for each data type
essentially every index is the actual restaurant index and every value is the order index
(reverse of current sorted indices)
then get layout order for info divs through that array
*/

next_page_button.addEventListener("click", () => {
  if (currentSearchResult) currentSearchResult.nextPage();
});

prev_page_button.addEventListener("click", () => {
  if (currentSearchResult) currentSearchResult.prevPage();
});

id_search_button.addEventListener("click", () => {
  const input = id_search_input.value;

  const results = filterStrings(data.ID, sorted.ID, input);
  const sortedResults = sortBy(results, sorted.storeName);

  currentSearchResult = new SearchResult(sortedResults);
});

name_search_button.addEventListener("click", () => {
  const input = name_search_input.value;

  const results = filterStrings(data.storeName, sorted.storeName, input);

  currentSearchResult = new SearchResult(results);
});

xy_search_button.addEventListener("click", () => {
  const xInput = Number(x_search_input.value);
  const yInput = Number(y_search_input.value);

  if (isNaN(xInput) || isNaN(yInput)) return;

  const xResuslts = filterNumbers(data.x, sorted.x, xInput, xInput);
  const yResults = filterNumbers(data.y, sorted.y, yInput, yInput);
  const finalResults = getIntersections(xResuslts, yResults);

  currentSearchResult = new SearchResult(finalResults);
});

// let t1 = performance.now();
// sorted.cost = sortNumbers(data.cost);

// let t2 = performance.now();
// const filtered = filterNumbers(data.review, sorted.review, 4, 5);

// let t3 = performance.now();
// const filtered2 = filterNumbers(data.cost, sorted.cost, 0, 10);

// let t4 = performance.now();
// const intersections = getIntersections([filtered, filtered2]);

// let t5 = performance.now();
// const resorted = sortBy(intersections, sorted.storeName);
// let t6 = performance.now();

// console.log("Sort performance:", t2 - t1);
// console.log("Search performance 1:", t3 - t2);
// console.log("Search performance 2:", t4 - t3);
// console.log("Intersection performance:", t5 - t4);
// console.log("Resort performance:", t6 - t5);

// function printStuff(reference: any[], indices: Uint32Array | number[]) {
//   let p = new Array(indices.length);

//   for (let i = 0; i < indices.length; i++) {
//     p[i] = reference[indices[i]];
//   }

//   console.log(p);
// }

// printStuff(data.review, sorted.review);
// printStuff(data.cost, sorted.cost);
// printStuff(data.review, filtered);
// printStuff(data.cost, filtered2);
// printStuff(data.review, intersections);
// printStuff(data.storeName, resorted);