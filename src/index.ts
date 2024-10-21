// We link all our html elements here.
// #region html elements
const ID_SEARCH_INPUT = document.getElementById("id-search-input") as HTMLInputElement;
const ID_SEARCH_BUTTON = document.getElementById("id-search-button") as HTMLButtonElement;
const NAME_SEARCH_INPUT = document.getElementById("name-search-input") as HTMLInputElement;
const NAME_SEARCH_BUTTON = document.getElementById("name-search-button") as HTMLButtonElement;
const X_SEARCH_INPUT = document.getElementById("x-search-input") as HTMLInputElement;
const Y_SEARCH_INPUT = document.getElementById("y-search-input") as HTMLInputElement;
const XY_SEARCH_BUTTON = document.getElementById("xy-search-button") as HTMLButtonElement;

const TYPE_SELECT = document.getElementById("type-filter") as HTMLSelectElement;

const SORT_SELECT = document.getElementById("sort-select") as HTMLSelectElement;
const SORT_DIRECTION = document.getElementById("sort-direction") as HTMLButtonElement;

const PAGE_SIZE_INPUT = document.getElementById("page-size") as HTMLInputElement;
const NEXT_PAGE_BUTTON = document.getElementById("next-page") as HTMLButtonElement;
const PREV_PAGE_BUTTON = document.getElementById("prev-page") as HTMLButtonElement;
const PAGE_NUMBER_INPUT = document.getElementById("page-number-input") as HTMLInputElement;
const PAGE_COUNT = document.getElementById("page-count") as HTMLSpanElement;

const SEARCH_RESULTS = document.getElementById("search-results") as HTMLDivElement;
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

    this.loadTypes();

    // Calculate and update distances based on current location.
    this.updateDistances();

    // Initialize the current search with store names and an empty query.
    this.currentSearch = new SearchResult(this, this.sorted.storeName);
    this.initInput(); // Set up input handling for searches.
  }

  createTypeOption(name: string) {
    const option = document.createElement("option");
    option.innerText = name;
    option.value = name;

    TYPE_SELECT.appendChild(option);
  }

  /**
   * Loads restaurant types into the sorted data structure. 
   * This method iterates over all restaurants and organizes them by their types.
   * 
   * @timecomplexity O(n) - The method loops through `App.restaurantCount`, performing constant time operations for each restaurant.
   */
  loadTypes() {
    const typePointers: {[key: string]: number} = {};

    for (let i = 0; i < App.restaurantCount; i++) {
      const index = this.sorted.storeName[i]; // Get the original index of the restaurant from the sorted store names.
      const type = this.data.type[index]; // Retrieve the type of the restaurant using the index.

      // If the type doesn't exist in the sorted type object, initialize it as an empty array.
      if (!this.sorted.type[type]) {
        this.sorted.type[type] = [];
        typePointers[type] = 0;

        this.createTypeOption(type);
      }

      // Store the original index of the restaurant under its type in the sorted structure.
      this.sorted.type[type][typePointers[type]++] = index;
    }
  }

  /**
   * Updates distances based on the current location.
   * 
   * @timecomplexity O(n) - The distance calculation iterates over the list of restaurants, resulting in a linear time complexity.
   */
  updateDistances() {
    for (let i = 0; i < App.restaurantCount; i++) {
      const xDist = this.locationX - data.x[i];
      const yDist = this.locationY - data.y[i];

      this.sorted.distData[i] = Math.sqrt(xDist ** 2 + yDist ** 2);
    }

    sortNumbers(this.sorted.distData, this.sorted.distSorted);
    getSortOrders(this.sorted.distSorted, this.sorted.distOrder);
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

    this.updateDistances(); // Recalculate distances based on the new location.
  }

  /**
   * Initializes the input handling for search queries.
   * 
   * @timecomplexity O(1) - Setup tasks for input handling are constant time operations.
   */
  initInput() {
    ID_SEARCH_BUTTON.addEventListener("click", () => {
      this.currentSearch = SearchResult.fromID(this, ID_SEARCH_INPUT.value);
    });

    NAME_SEARCH_BUTTON.addEventListener("click", () => {
      this.currentSearch = SearchResult.fromName(this, NAME_SEARCH_INPUT.value);
    });

    XY_SEARCH_BUTTON.addEventListener("click", () => {
      const xInput = Number(X_SEARCH_INPUT.value);
      const yInput = Number(Y_SEARCH_INPUT.value);

      if (isNaN(xInput) || isNaN(yInput)) return;

      this.currentSearch = SearchResult.fromCoords(this, xInput, yInput);
    });

    TYPE_SELECT.addEventListener("input", () => {
      this.currentSearch.setTypeFilter(TYPE_SELECT.value);
    });

    SORT_SELECT.addEventListener("input", () => {
      const value = SORT_SELECT.value as SortFieldType;

      if (value == "review") this.currentSearch.toggleDirection(); // set to descending
      else this.currentSearch.toggleDirection(); // otherwise set to ascending

      this.currentSearch.changeSort(value as SortFieldType);
    });

    SORT_DIRECTION.addEventListener("click", () => {
      this.currentSearch.toggleDirection();
    });

    PAGE_SIZE_INPUT.addEventListener("input", () => {
      let input = Number(PAGE_SIZE_INPUT.value);
      
      if (!isNaN(input)) this.currentSearch.changePageSize(input);
    });

    NEXT_PAGE_BUTTON.addEventListener("click", () => {
      this.currentSearch.incrementPage(1);
    });

    PREV_PAGE_BUTTON.addEventListener("click", () => {
      this.currentSearch.incrementPage(-1);
    });

    PAGE_NUMBER_INPUT.addEventListener("keypress", (event: KeyboardEvent) => {
      if (event.key == "Enter") {
        const input = Number(PAGE_NUMBER_INPUT.value);

        if (!isNaN(input)) this.currentSearch.setPage(input - 1);
      }
    });
  }
}

class SortOperator {

}

type SortFieldType = "storeName" | "cost" | "review";

/**
 * Represents the results of a search operation, handling pagination, sorting, 
 * and displaying restaurant information.
 * 
 * @class
 * @property {Uint32Array} results - The array of result indices.
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
  static minPageSize: number = 1; // Minimum page size.
  static maxPageSize: number = 100; // Maximum page size.

  public includesAll: boolean; // Whether or not the results include all of the values.

  public sort: SortFieldType = "storeName";
  public typeFilter: string = "";
  public costMin: number = -1;
  public costMax: number = -1;
  public reviewMin: number = -1;
  public reviewMax: number = -1;

  public final: Uint32Array; // Sorted array of result indices.
  public finalCount: number;

  public page: number = 0; // Current page number.
  public pageCount: number; // Total number of pages.
  public descending: boolean = false; // Sort order flag.

  /**
   * Initializes a new instance of the SearchResult class.
   * 
   * @param {App} app - The app instance that contains the data.
   * @param {Uint32Array} results - The array of result indices.
   * 
   * @timecomplexity O(1) - Initialization involves simple assignments and a constant time calculation for `pageCount`.
   */
  constructor(public app: App, public results: Uint32Array) {
    this.updateFinal();
  }

  static fromName(app: App, name: string): SearchResult {
    const results = filterStrings(data.storeName, app.sorted.storeName, name);

    return new SearchResult(app, results);
  }

  static fromID(app: App, id: string): SearchResult {
    const results = filterStrings(app.data.ID, app.sorted.ID, id);
    const sorted = sortBy(results, App.restaurantCount, app.sorted.storeName);

    return new SearchResult(app, sorted);
  }

  static fromCoords(app: App, x: number, y: number): SearchResult {
    const resultsX = filterNumbers(app.data.x, app.sorted.x, x, x);
    const resultsY = filterNumbers(app.data.y, app.sorted.y, y, y);
    const sortedIntersections = getIntersections([resultsX, resultsY], App.restaurantCount, app.sorted.storeName);

    return new SearchResult(app, sortedIntersections);
  }

  public setTypeFilter(type: string) {
    this.typeFilter = type;
    this.updateFinal();
  }

  public setCostRange(min: number, max: number) {
    this.costMin = min;
    this.costMax = max;
    this.updateFinal();
  }

  public setReviewRange(min: number, max: number) {
    this.reviewMin = min;
    this.reviewMax = max;
    this.updateFinal();
  }

  public changeSort(newSort: SortFieldType) {
    this.sort = newSort;
    this.updateFinal();
  }

  /**
   * Toggles the sort order between ascending and descending.
   * 
   * @timecomplexity O(n) - Calls `loadResults`, which iterates through the current page size, leading to linear time complexity.
   */
  public toggleDirection() {
    this.descending = !this.descending; // Toggle the order.
    this.displayUpdate(); // Reload results based on the new order.
  }

  /**
   * Changes the number of results displayed per page. Clamps the value to be between 1 and 100.
   *
   * @param {number} n - The new page size.
   * 
   * @timecomplexity O(1) - The method consists of simple arithmetic operations and assignments.
   */
  public changePageSize(n: number) {
    SearchResult.pageSize = clamp(n, SearchResult.minPageSize, SearchResult.maxPageSize); // Update static page size.

    this.displayUpdate();
  }

  /**
   * Increments or decrements the current page by a specified amount, wrapping around as necessary.
   * 
   * @param {number} amount - The amount to change the page by (can be negative).
   * 
   * @timecomplexity O(1) - The method consists of simple arithmetic and updates, resulting in constant time operations.
   */
  public incrementPage(amount: number) {
    this.page = circleMod(this.page + amount, this.pageCount); // Update page with circular behavior.
    this.displayUpdate(); // Update page info.
  }

  /**
   * Sets the current page to a specified number, clamping the value to valid page indices.
   * 
   * @param {number} n - The new page number (0-based index).
   * 
   * @timecomplexity O(1) - Simple arithmetic and assignments lead to constant time complexity.
   */
  public setPage(n: number) {
    n = clamp(n, 0, this.pageCount - 1); // Ensure n is within valid range.

    if (n == this.page) return; // Return if no change.

    this.page = n; // Update the current page.
    this.displayUpdate(); // Update page info display.
  }

  public updatePageCount() {
    this.page = 0;
    this.pageCount = Math.ceil(this.finalCount/SearchResult.pageSize);
  }

  public updateFinal() {
    let filteredType;
    let filteredCost;
    let filteredReview;

    // make sure steps are skipped if results/any filters are empty
    // optimize and cleanup code (fix stuff with number[] | Uint32Array and make sure everything is Uint32Array from initialization )

    if (this.typeFilter != "") {
      filteredType = this.app.sorted.type[this.typeFilter];
    }

    if (this.costMin > 0 && this.costMax > 0) {
      filteredCost = filterNumbers(this.app.data.cost, this.app.sorted.cost, this.costMin, this.costMax);
    }

    if (this.reviewMin > 0 && this.reviewMax > 0) {
      filteredReview = filterNumbers(this.app.data.review, this.app.sorted.review, this.reviewMin, this.reviewMax);
    }

    const data: (Uint32Array | number[])[] = [];
    let dataPointer = 0;
    let sorted;

    if (this.sort == "storeName") {
      data[dataPointer++] = this.results;
      
      if (filteredType) data[dataPointer++] = filteredType;
      if (filteredCost) data[dataPointer++] = filteredCost;
      if (filteredReview) data[dataPointer++] = filteredReview;

    } else if (this.sort == "cost" && filteredCost) {
      data[dataPointer++] = filteredCost;
      data[dataPointer++] = this.results;

      if (filteredType) data[dataPointer++] = filteredType;
      if (filteredReview) data[dataPointer++] = filteredReview;

    } else if (this.sort == "review" && filteredReview) {
      data[dataPointer++] = filteredReview;
      data[dataPointer++] = this.results;
      
      if (filteredCost) data[dataPointer++] = filteredCost;
      if (filteredType) data[dataPointer++] = filteredType;

    } else {
      sorted = this.app.sorted[this.sort];

      data[dataPointer++] = this.results;
      if (filteredType) data[dataPointer++] = filteredType;
      if (filteredCost) data[dataPointer++] = filteredCost;
      if (filteredReview) data[dataPointer++] = filteredReview;
    }

    let final = this.results;

    if (dataPointer > 1) final = getIntersections(data, App.restaurantCount, sorted);
    else if (dataPointer == 1) {
      if (sorted) final = sortBy(data[0], App.restaurantCount, sorted);
      else final = new Uint32Array(data[0]);
    }

    this.final = final;
    this.finalCount = final.length;

    this.updatePageCount();
    this.displayUpdate();
  }

  /**
   * Creates and displays information for a restaurant result based on its order and index.
   * 
   * @param {number} order - The order of the result to display.
   * @param {number} index - The index of the restaurant in the original data.
   * 
   * @timecomplexity O(1) - The method creates UI elements and formats strings, all of which are constant time operations.
   */
  public createRestaurauntInfo(order: number, index: number) {
    const div = document.createElement("div"); // Create a new div for the restaurant info.

    // Create a new paragraph element for details
    const p = document.createElement("p");

    // Create individual spans for each piece of information
    const resultSpan = document.createElement("p");
    resultSpan.innerText = `Result #${order + 1}`;
    resultSpan.classList.add("font-bold", "text-xl", "block", "mb-2"); // Bold and larger text

    const idSpan = document.createElement("p");
    idSpan.innerText = `ID: ${this.app.data.ID[index]}`;
    idSpan.classList.add("font-medium", "text-gray-300", "block"); // Medium font weight with light gray

    const nameSpan = document.createElement("p");
    nameSpan.innerText = `Name: ${this.app.data.storeName[index]}`;
    nameSpan.classList.add("font-semibold", "text-gray-200", "block"); // Semibold font weight

    const typeSpan = document.createElement("p");
    typeSpan.innerText = `Type: ${this.app.data.type[index]}`;
    typeSpan.classList.add("font-light", "text-gray-400", "block"); // Light font weight

    const costSpan = document.createElement("p");
    costSpan.innerText = `Cost: $${this.app.data.cost[index].toFixed(2)}`;
    costSpan.classList.add("font-bold", "text-green-400", "block"); // Bold with green text

    const reviewSpan = document.createElement("p");
    reviewSpan.innerText = `Review: ${this.app.data.review[index].toFixed(1)}`;
    reviewSpan.classList.add("font-semibold", "text-blue-400", "block"); // Semibold with blue text

    const positionSpan = document.createElement("p");
    positionSpan.innerText = `Position: (x: ${this.app.data.x[index]}, y: ${this.app.data.y[index]})`;
    positionSpan.classList.add("font-medium", "text-gray-300", "block"); // Medium font weight

    // Append spans to the paragraph
    p.appendChild(resultSpan);
    p.appendChild(idSpan);
    p.appendChild(nameSpan);
    p.appendChild(typeSpan);
    p.appendChild(costSpan);
    p.appendChild(reviewSpan);
    p.appendChild(positionSpan);

    // Add classes for the main div
    div.classList.add("bg-gray-800", "border", "border-gray-700", "rounded", "p-4", "mb-4", "shadow-md");

    div.appendChild(p); // Append paragraph to div.
    SEARCH_RESULTS.appendChild(div); // Append div to results container.
  }

  /**
   * Loads the results for the current page and updates the UI.
   * 
   * @timecomplexity O(n) - Where n is the page size. The method loops through the page size to load results, hence linear time.
   */
  public displayUpdate() {
    PAGE_SIZE_INPUT.value = String(SearchResult.pageSize); // Update page size input.
    PAGE_NUMBER_INPUT.value = String(this.page + 1); // Update current page number (1-based index).
    PAGE_COUNT.innerText = String(this.pageCount == 0 ? 1 : this.pageCount); // Display total pages, ensure at least 1.

    SORT_DIRECTION.innerText = this.descending ? "Descending" : "Ascending"; // Update sort order display.
    SEARCH_RESULTS.innerHTML = ""; // Clear previous results.

    // Loop through the number of results per page and load them.
    for (let i = 0; i < SearchResult.pageSize; i++) {
      const change = this.page * SearchResult.pageSize + i; // Calculate the index for the current result.
      const current = this.descending ? this.finalCount - 1 - change : change; // Adjust index based on sort order.

      if (current >= this.finalCount || current < 0) break; // Break if current index is out of bounds.

      this.createRestaurauntInfo(current, this.final[current]); // Load the restaurant info.
    }
  }
}

class DisplayMap {

}

new App(data);