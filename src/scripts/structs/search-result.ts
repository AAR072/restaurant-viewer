const SEARCH_RESULTS = document.getElementById("search-results") as HTMLDivElement;

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

  static fromSearch(app: App, name?: string, id?: string, x?: number, y?: number) {

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
    this.pageCount = Math.ceil(this.finalCount / SearchResult.pageSize);
  }

  public updateFinal() {
    let filteredType;
    let filteredCost;
    let filteredReview;

    // make sure steps are skipped if results/any filters are empty
    // optimize and cleanup code (fix stuff with number[] | Uint32Array and make sure everything is Uint32Array from initialization )

    if (this.typeFilter != "") {
      filteredType = this.app.getCuisineTypeArr(this.typeFilter);
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
    // Create a new div for the restaurant info
    const div = document.createElement("div");

    // Add bubble-like styles to the main div
    div.style.border = '1px solid #444';  // Dark border
    div.style.borderRadius = '15px';  // Rounded corners for the bubble effect
    div.style.padding = '15px';  // Increased padding for a more spacious look
    div.style.marginBottom = '10px';  // Space between bubbles
    div.style.backgroundColor = '#2e2e2e';  // Dark background to match theme
    div.style.color = '#fff';  // White text for readability
    div.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';  // Slight shadow for elevation

    // Create individual paragraphs for each piece of information
    const resultSpan = document.createElement("p");
    resultSpan.innerText = `Result #${order + 1}`;
    resultSpan.style.fontWeight = 'bold';
    resultSpan.style.fontSize = '1.25rem';  // Adjust font size
    resultSpan.style.marginBottom = '0.5rem';  // Space below the heading

    const idSpan = document.createElement("p");
    idSpan.innerText = `ID: ${this.app.data.ID[index]}`;
    idSpan.style.fontWeight = '500';  // Medium font weight
    idSpan.style.color = '#ccc';  // Light gray color

    const nameSpan = document.createElement("p");
    nameSpan.innerText = `Name: ${this.app.data.storeName[index]}`;
    nameSpan.style.fontWeight = '600';  // Semibold font weight
    nameSpan.style.color = '#e0e0e0';  // Slightly lighter gray

    const typeSpan = document.createElement("p");
    typeSpan.innerText = `Type: ${this.app.data.type[index]}`;
    typeSpan.style.fontWeight = '300';  // Light font weight
    typeSpan.style.color = '#b0b0b0';  // Lighter gray for less emphasis

    const costSpan = document.createElement("p");
    costSpan.innerText = `Cost: $${this.app.data.cost[index].toFixed(2)}`;
    costSpan.style.fontWeight = 'bold';  // Bold font weight
    costSpan.style.color = '#4caf50';  // Green color for cost

    const reviewSpan = document.createElement("p");
    reviewSpan.innerText = `Review: ${this.app.data.review[index].toFixed(1)}`;
    reviewSpan.style.fontWeight = '600';  // Semibold font weight
    reviewSpan.style.color = '#2196F3';  // Blue color for reviews

    const positionSpan = document.createElement("p");
    positionSpan.innerText = `Position: (x: ${this.app.data.x[index]}, y: ${this.app.data.y[index]})`;
    positionSpan.style.fontWeight = '500';  // Medium font weight
    positionSpan.style.color = '#ccc';  // Light gray color

    // Append spans to the div
    div.appendChild(resultSpan);
    div.appendChild(idSpan);
    div.appendChild(nameSpan);
    div.appendChild(typeSpan);
    div.appendChild(costSpan);
    div.appendChild(reviewSpan);
    div.appendChild(positionSpan);

    // Append the styled div to the results container
    SEARCH_RESULTS.appendChild(div);
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