// We link all our html elements here.
// #region html elements
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
// #endregion

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

// Our database after it is sorted
interface SortedData {
  ID: Uint32Array; // Sorted array of IDs.

  storeName: Uint32Array; // Sorted array of store names.
  nameOrder: Uint32Array; // Order array to map back the original indices of the sorted store names.

  type: { [key: string]: number[] }; // Dictionary to hold types and their corresponding indices.

  cost: Uint32Array; // Sorted array of costs.
  costOrder: Uint32Array; // Order array to map back the original indices of the sorted costs.

  review: Uint32Array; // Sorted array of reviews.
  reviewOrder: Uint32Array; // Order array to map back the original indices of the sorted reviews.

  x: Uint32Array; // Sorted array of x coordinates.
  y: Uint32Array; // Sorted array of y coordinates.

  distData: Float32Array; // Array to hold calculated distances.
  distSorted: Uint32Array; // Sorted array of distances.
  distOrder: Uint32Array; // Order array to map back the original indices of the sorted distances.
}

type SortDataField = "storeName" | "cost" | "review";

const data: Data = loadJSON("DO_NOT_TOUCH/data.json") as Data; // Load data from JSON file.

/**
 * Represents the main application managing restaurant data and search functionalities.
 * 
 * @class
 * @property {Data} data - The unprocessed restaurant data loaded from a JSON file.
 * @property {SortedData} sorted - The processed and sorted data structure for efficient searching and display.
 * @property {number} locationX - The user's current X coordinate for location-based searches.
 * @property {number} locationY - The user's current Y coordinate for location-based searches.
 * @property {number} pageSize - The number of results to display per page.
 * @property {SearchResult} currentSearch - The current search results object, managing pagination and sorting.
 * 
 * @param {Data} data - The unprocessed restaurant data to initialize the app with.
 */
class App {
  static restaurantCount: number = 100000; // Maximum number of restaurants.

  public data: Data; // Holds the original data.
  public sorted: SortedData; // Holds the sorted data.

  public locationX: number = 0; // User's current X location.
  public locationY: number = 0; // User's current Y location.
  public pageSize: number = 10; // Number of items to display per page.

  public currentSearch: SearchResult; // Holds the current search result.

  /**
   * Initializes the App with the given data and sorts it accordingly.
   *
   * @param {Data} data - The data to be processed and sorted.
   * 
   * @timecomplexity O(n log n) - Sorting operations for each sortable field use merge sort, which has a time complexity of O(n log n). The initialization of the sorted object involves multiple sorts.
   */
  constructor(data: Data) {
    this.data = data; // Store the original data.

    // Initialize the sorted data with sorted arrays and corresponding order arrays.
    this.sorted = {
      ID: sortStrings(data.ID), // Sort IDs.

      storeName: sortStrings(data.storeName), // Sort store names.
      nameOrder: new Uint32Array(App.restaurantCount), // Array to hold original indices of sorted store names.

      type: {}, // Initialize type dictionary.

      cost: sortNumbers(data.cost), // Sort costs.
      costOrder: new Uint32Array(App.restaurantCount), // Array to hold original indices of sorted costs.

      review: sortNumbers(data.review), // Sort reviews.
      reviewOrder: new Uint32Array(App.restaurantCount), // Array to hold original indices of sorted reviews.

      x: sortNumbers(data.x), // Sort x coordinates.
      y: sortNumbers(data.y), // Sort y coordinates.

      distData: new Float32Array(App.restaurantCount), // Array for distances.
      distSorted: new Uint32Array(App.restaurantCount), // Array for sorted distances.
      distOrder: new Uint32Array(App.restaurantCount) // Array to hold original indices of sorted distances.
    };

    // Populate order arrays based on sorted data.
    getSortOrders(this.sorted.storeName, this.sorted.nameOrder);
    getSortOrders(this.sorted.cost, this.sorted.costOrder);
    getSortOrders(this.sorted.review, this.sorted.reviewOrder);

    // Calculate and update distances based on current location.
    this.updateDistance();

    console.log(this.sorted); // Log the sorted data for debugging.

    // Initialize the current search with store names and an empty query.
    this.currentSearch = new SearchResult(this, this.sorted.storeName, "");
    this.initInput(); // Set up input handling for searches.
  }

  /**
   * Initializes the input handling for search queries.
   * 
   * @timecomplexity O(1) - Setup tasks for input handling are constant time operations.
   */
  initInput() {
    page_size_input.addEventListener("keypress", (event: KeyboardEvent) => {
      if (event.key == "Enter") {
        let input = Number(page_size_input.value);

        if (isNaN(input)) return;

        this.currentSearch.changePageSize(input);
      }
    });

    next_page_button.addEventListener("click", () => {
      this.currentSearch.increment(1);
    });

    prev_page_button.addEventListener("click", () => {
      this.currentSearch.increment(-1);
    });

    page_number_input.addEventListener("keypress", (event: KeyboardEvent) => {
      if (event.key == "Enter") {
        const input = Number(page_number_input.value);

        if (!isNaN(input)) this.currentSearch.setPage(input - 1);
      }
    });

    search_order.addEventListener("click", () => {
      this.currentSearch.toggleOrder();
    });

    id_search_button.addEventListener("click", () => {
      const input = id_search_input.value;

      const results = filterStrings(data.ID, this.sorted.ID, input);

      this.currentSearch = new SearchResult(this, results, "ID");
    });

    name_search_button.addEventListener("click", () => {
      const input = name_search_input.value;

      const results = filterStrings(data.storeName, this.sorted.storeName, input);

      this.currentSearch = new SearchResult(this, results, "storeName");
    });

    xy_search_button.addEventListener("click", () => {
      const xInput = Number(x_search_input.value);
      const yInput = Number(y_search_input.value);

      if (isNaN(xInput) || isNaN(yInput)) return;

      const xResuslts = filterNumbers(data.x, this.sorted.x, xInput, xInput);
      const yResults = filterNumbers(data.y, this.sorted.y, yInput, yInput);
      const finalResults = getIntersections(xResuslts, yResults);

      this.currentSearch = new SearchResult(this, finalResults, "x");
    });
  }

  /**
   * Updates distances based on the current location.
   * 
   * @timecomplexity O(n) - The distance calculation iterates over the list of restaurants, resulting in a linear time complexity.
   */
    updateDistance() {
      for (let i = 0; i < App.restaurantCount; i++) {
        const xDist = this.locationX - data.x[i];
        const yDist = this.locationY - data.y[i];
  
        this.sorted.distData[i] = Math.sqrt(xDist ** 2 + yDist ** 2);
      }
  
      sortNumbers(this.sorted.distData, this.sorted.distSorted);
      getSortOrders(this.sorted.distSorted, this.sorted.distOrder);
    }
    
  /**
   * Loads restaurant types into the sorted data structure. 
   * This method iterates over all restaurants and organizes them by their types.
   * 
   * @timecomplexity O(n) - The method loops through `App.restaurantCount`, performing constant time operations for each restaurant.
   */
  loadTypes() {
    for (let i = 0; i < App.restaurantCount; i++) {
      const index = this.sorted.storeName[i]; // Get the original index of the restaurant from the sorted store names.
      const type = this.data.type[index]; // Retrieve the type of the restaurant using the index.

      // If the type doesn't exist in the sorted type object, initialize it as an empty array.
      if (!this.sorted.type[type]) this.sorted.type[type] = [];

      // Store the original index of the restaurant under its type in the sorted structure.
      this.sorted.type[type][i] = index; 
    }
  }

  /**
   * Changes the user's current location to the specified coordinates (x, y).
   * This method updates the location and recalculates distances to restaurants.
   *
   * @param {number} x - The new X coordinate of the user's location.
   * @param {number} y - The new Y coordinate of the user's location.
   * 
   * @timecomplexity O(n) - The method updates the location and calls `updateDistance()`, which is assumed to iterate through the restaurant list, resulting in a linear time complexity.
   */
  changeLocation(x: number, y: number) {
    this.locationX = x; // Update the X location.
    this.locationY = y; // Update the Y location.

    this.updateDistance(); // Recalculate distances based on the new location.
  }


  resortSearchResult() {
    // handle sorting and accessing data stuff here
  }

}

class SortOperator {

}

/**
 * Represents the results of a search operation, handling pagination, sorting, 
 * and displaying restaurant information.
 * 
 * @class
 * @property {Uint32Array} results - The array of result indices.
 * @property {number} resultCount - The total number of results.
 * @property {Uint32Array} sorted - The sorted array of result indices.
 * @property {string} defaultSort - The default field used for sorting results.
 * @property {number} page - The current page number.
 * @property {number} pageCount - The total number of pages.
 * @property {boolean} descending - The flag indicating if the results are sorted in descending order.
 * 
 * @param {App} app - The app instance that contains the data.
 * @param {Uint32Array} results - The array of result indices.
 * @param {string} defaultSort - The field used for sorting results.
 */
class SearchResult {
  static pageSize: number = 10; // Default number of results per page.

  public results: Uint32Array; // Array of result indices.
  public resultCount: number; // Total number of results.
  public sorted: Uint32Array; // Sorted array of result indices.
  public defaultSort: string; // Default sort field.
  public page: number = 0; // Current page number.
  public pageCount: number; // Total number of pages.
  public descending: boolean = false; // Sort order flag.

  /**
   * Initializes a new instance of the SearchResult class.
   * 
   * @param {App} app - The app instance that contains the data.
   * @param {Uint32Array} results - The array of result indices.
   * @param {string} defaultSort - The field used for sorting results.
   * 
   * @timecomplexity O(1) - Initialization involves simple assignments and a constant time calculation for `pageCount`.
   */
  constructor(public app: App, results: Uint32Array, defaultSort: string) {
    this.results = results; // Store the result indices.
    this.resultCount = results.length; // Count of results.
    this.defaultSort = defaultSort; // Set the default sort field.
    this.pageCount = Math.ceil(this.resultCount / SearchResult.pageSize); // Calculate total page count.
    this.loadPageInfo(); // Load page information for display.
    this.loadResults(); // Load the initial results for the current page.
  }

  /**
   * Changes the number of results displayed per page. Clamps the value to be between 1 and 100.
   *
   * @param {number} n - The new page size.
   * 
   * @timecomplexity O(1) - The method consists of simple arithmetic operations and assignments.
   */
  changePageSize(n: number) {
    n = clamp(n, 1, 100); // Ensure n is within valid range.

    if (n == SearchResult.pageSize) return; // Return if no change.

    SearchResult.pageSize = n; // Update static page size.
    this.page = 0; // Reset to the first page.
    this.pageCount = Math.ceil(this.resultCount / SearchResult.pageSize); // Recalculate total pages.

    this.loadPageInfo(); // Update the displayed page info.
    this.loadResults(); // Load results for the new page size.
  }

  /**
   * Loads and displays the current page information, including page size and page number.
   * 
   * @timecomplexity O(1) - This method updates UI elements and involves constant time operations.
   */
  loadPageInfo() {
    page_size_input.value = String(SearchResult.pageSize); // Update page size input.
    page_number_input.value = String(this.page + 1); // Update current page number (1-based index).
    page_count.innerText = String(this.pageCount == 0 ? 1 : this.pageCount); // Display total pages, ensure at least 1.
  }

  /**
   * Creates and displays information for a restaurant result based on its order and index.
   * 
   * @param {number} order - The order of the result to display.
   * @param {number} index - The index of the restaurant in the original data.
   * 
   * @timecomplexity O(1) - The method creates UI elements and formats strings, all of which are constant time operations.
   */
  createRestaurauntInfo(order: number, index: number) {
    const div = document.createElement("div"); // Create a new div for the restaurant info.
    const p = document.createElement("p"); // Create a new paragraph element for details.

    // Format and set the inner text with restaurant details.
    p.innerText = `
    Result #${order + 1}\n
    ID: ${this.app.data.ID[index]}\n
    Name: ${this.app.data.storeName[index]}\n
    Type: ${this.app.data.type[index]}\n
    Cost: $${this.app.data.cost[index].toFixed(2)}\n
    Review: ${this.app.data.review[index].toFixed(1)}\n
    Position: (x: ${this.app.data.x[index]}, y: ${this.app.data.y[index]})
    `;

    div.appendChild(p); // Append paragraph to div.
    search_results.appendChild(div); // Append div to results container.
  }

  /**
   * Loads the results for the current page and updates the UI.
   * 
   * @timecomplexity O(n) - Where n is the page size. The method loops through the page size to load results, hence linear time.
   */
  loadResults() {
    search_order.innerText = this.descending ? "Descending" : "Ascending"; // Update sort order display.
    search_results.innerHTML = ""; // Clear previous results.

    // Loop through the number of results per page and load them.
    for (let i = 0; i < SearchResult.pageSize; i++) {
      const change = this.page * SearchResult.pageSize + i; // Calculate the index for the current result.
      const current = this.descending ? this.resultCount - 1 - change : change; // Adjust index based on sort order.

      if (current >= this.resultCount || current < 0) break; // Break if current index is out of bounds.

      this.createRestaurauntInfo(current, this.results[current]); // Load the restaurant info.
    }
  }

  /**
   * Increments or decrements the current page by a specified amount, wrapping around as necessary.
   * 
   * @param {number} amount - The amount to change the page by (can be negative).
   * 
   * @timecomplexity O(1) - The method consists of simple arithmetic and updates, resulting in constant time operations.
   */
  increment(amount: number) {
    this.page = circleMod(this.page + amount, this.pageCount); // Update page with circular behavior.

    this.loadPageInfo(); // Update page info.
    this.loadResults(); // Load results for the new page.
  }

  /**
   * Sets the current page to a specified number, clamping the value to valid page indices.
   * 
   * @param {number} n - The new page number (0-based index).
   * 
   * @timecomplexity O(1) - Simple arithmetic and assignments lead to constant time complexity.
   */
  setPage(n: number) {
    n = clamp(n, 0, this.pageCount - 1); // Ensure n is within valid range.

    if (n == this.page) return; // Return if no change.

    this.page = n; // Update the current page.
    this.loadPageInfo(); // Update page info display.
    this.loadResults(); // Load results for the new page.
  }

  /**
   * Toggles the sort order between ascending and descending.
   * 
   * @timecomplexity O(n) - Calls `loadResults`, which iterates through the current page size, leading to linear time complexity.
   */
  toggleOrder() {
    this.descending = !this.descending; // Toggle the order.
    this.loadResults(); // Reload results based on the new order.
  }

  /**
   * Placeholder for sorting functionality. This method is currently unimplemented.
   * 
   * @timecomplexity O(1) - As it is currently unimplemented, it has constant time complexity.
   */
  sortBy() {
    // Implementation for sorting results (not provided in the original code).
  }
}

class DisplayMap {

}

new App(data);

/*
possible idea, create "html sort" arrays for each data type
essentially every index is the actual restaurant index and every value is the order index
(reverse of current sorted indices)
then get layout order for info divs through that array
*/


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