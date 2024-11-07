const SEARCH_RESULTS = document.getElementById("search-results") as HTMLDivElement;

const SORT_DIR_TEXT = document.getElementById("sort-dir-text") as HTMLDivElement;

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
  static MIN_PAGE_SIZE: number = 1; // Minimum page size.
  static MAX_PAGE_SIZE: number = 100; // Maximum page size.

  static pageSize: number = 10; // Default number of results per page.

  public includesAll: boolean; // Whether or not the results include all of the values.

  public sort: SortFieldType = "storeName";
  public typeFilter: string = "";
  public costMin: number | null = null;
  public costMax: number | null = null;
  public reviewMin: number | null = null;
  public reviewMax: number | null = null;

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

  // static fromSearch(app: App, name?: string, id?: string, x?: number, y?: number) {

  // }

  public setTypeFilter(type: string) {
    this.typeFilter = type;
    this.updateFinal();
  }

  public setCostRange(min: number | null, max: number | null) {
    this.costMin = min;
    this.costMax = max;
    this.updateFinal();
  }

  public setReviewRange(min: number | null, max: number | null) {
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
    SearchResult.pageSize = clamp(n, SearchResult.MIN_PAGE_SIZE, SearchResult.MAX_PAGE_SIZE); // Update static page size.

    this.updatePageCount();
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
    n = clamp(n - 1, 0, this.pageCount - 1); // Ensure n is within valid range.

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

    if (this.costMin != null && this.costMax != null) {
      filteredCost = filterNumbers(this.app.data.cost, this.app.sorted.cost, this.costMin, this.costMax);
    }

    if (this.reviewMin != null && this.reviewMax != null) {
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

    if (dataPointer > 1) final = getIntersections(data, App.RESTAURANT_COUNT, sorted);
    else if (dataPointer == 1) {
      if (sorted) final = sortBy(data[0], App.RESTAURANT_COUNT, sorted);
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
  public createResultElement(order: number, index: number) {
    const info = this.app.createRestaurantInfo(index);

    const div = document.createElement("div");
    div.className = "result-container";

    const resultSpan = document.createElement("p");
    resultSpan.innerText = `Result #${order + 1}`;
    resultSpan.className = "result-title";

    const button = document.createElement("button");
    button.innerText = "View On Map";
    button.className = "result-map-button";
    button.type = "button";
    
    div.appendChild(resultSpan);
    div.appendChild(info);
    div.appendChild(button);

    button.addEventListener("click", () => {
      this.app.displayMap.viewRestaurant(index);
    });

    SEARCH_RESULTS.appendChild(div);
  }

  /**
   * Loads the results for the current page and updates the UI.
   * 
   * @timecomplexity O(n) - Where n is the page size. The method loops through the page size to load results, hence linear time.
   */
  public displayUpdate() {
    this.app.pageSizeTextbox.setValue(SearchResult.pageSize); // Update page size input.
    this.app.pageTextbox.setValue(this.page + 1); // Update current page number (1-based index).
    PAGE_COUNT.innerText = String(this.pageCount == 0 ? 1 : this.pageCount); // Display total pages, ensure at least 1.

    if (this.descending) {
      SORT_DIRECTION.classList.add("descending");
      SORT_DIR_TEXT.innerText = "Descending";

    } else {
      SORT_DIRECTION.classList.remove("descending");
      SORT_DIR_TEXT.innerText = "Ascending"
    }

    SEARCH_RESULTS.innerHTML = ""; // Clear previous results.

    // Loop through the number of results per page and load them.
    for (let i = 0; i < SearchResult.pageSize; i++) {
      const change = this.page * SearchResult.pageSize + i; // Calculate the index for the current result.
      const current = this.descending ? this.finalCount - 1 - change : change; // Adjust index based on sort order.

      if (current >= this.finalCount || current < 0) break; // Break if current index is out of bounds.

      this.createResultElement(current, this.final[current]); // Load the restaurant info.
    }
  }
}