// #region HTML elements
const SEARCH_RESULTS: HTMLDivElement = document.getElementById(
  'search-results'
) as HTMLDivElement;
const SORT_DIR_TEXT: HTMLDivElement = document.getElementById(
  'sort-dir-text'
) as HTMLDivElement;
// #endregion

type SortFieldType = 'storeName' | 'cost' | 'review';

/** Represents the results of a search operation, handling pagination, sorting, and displaying restaurant information. */
class SearchResult {
  static MIN_PAGE_SIZE: number = 1;
  static MAX_PAGE_SIZE: number = 100;

  /** The number of results displayed per page. */
  public pageSize: number = 10;

  public sort: SortFieldType = 'storeName';
  public typeFilter: string = '';
  public costMin: number | null = null;
  public costMax: number | null = null;
  public reviewMin: number | null = null;
  public reviewMax: number | null = null;

  public results: Uint32Array;

  /** The final filtered and sorted results to be displayed. */
  public final: Uint32Array;
  public finalCount: number;

  public page: number = 0;
  public pageCount: number;
  public descending: boolean = false;

  /**
   * Initializes the a new search result and displays its results.
   * @param app The app instance that contains the data.
   * @timecomplexity O(1), O(log n) or O(n) because of update final call in clear search call.
   */
  constructor(public app: App) {
    this.clearSearch();
  }

  /**
   * Sets the search results array based on name, id, x and y inputs.
   * @param name The name input.
   * @param id The id input
   * @param x The x input.
   * @param y The y input.
   * @timecomplexity O(log n) or O(n) depending on amount of valid input parameters, and sort/filters because of update final call.
   */
  public setSearch(name: string, id: string, x: number, y: number): void {
    const total: Uint32Array[] = [];
    let totalPointer: number = 0;
    let alreadySorted: boolean = false;

    // Add filtered results for the valid search parameters to the total array

    if (name !== '') {
      total[totalPointer++] = filterStrings(
        this.app.data.storeName,
        this.app.sorted.storeName,
        name
      );
      alreadySorted = true;
    }

    if (id !== '') {
      total[totalPointer++] = filterStrings(
        this.app.data.ID,
        this.app.sorted.ID,
        id
      );
    }
    if (!isNaN(x)) {
      total[totalPointer++] = filterNumbers(
        this.app.data.x,
        this.app.sorted.x,
        x,
        x
      );
    }
    if (!isNaN(y)) {
      total[totalPointer++] = filterNumbers(
        this.app.data.y,
        this.app.sorted.y,
        y,
        y
      );
    }

    if (totalPointer === 1) {
      if (alreadySorted) {
        this.results = total[0];
      } // Set results to first results if already sorted alphabetically
      else {
        this.results = sortBy(
          total[0],
          App.RESTAURANT_COUNT,
          this.app.sorted.storeName
        );
      } // Set results to sorted first results if not sorted
    } else if (totalPointer > 1) {
      // Get intersections of search parameters if more than one
      this.results = getIntersections(
        total,
        App.RESTAURANT_COUNT,
        alreadySorted ? undefined : this.app.sorted.storeName
      );
    }

    this.updateFinal();
  }

  /**
   * Sets results to all restaurants and displays the update.
   * @timecomplexity O(1), O(log n) or O(n) because of update final.
   */
  public clearSearch(): void {
    this.results = this.app.sorted.storeName;
    this.updateFinal();
  }

  /**
   * Sets results to the specified results array.
   * @param results The new search results.
   * @timecomplexity O(1), O(log n) or O(n) because of update final.
   */
  public setResults(results: Uint32Array): void {
    this.results = results;
    this.updateFinal();
  }

  /**
   * Sets the cuisine type filter and displays the changes.
   * @param type The cuisine type to show.
   * @timecomplexity O(1), O(log n) or O(n) because of update final.
   */
  public setTypeFilter(type: string): void {
    this.typeFilter = type;
    this.updateFinal();
  }

  /**
   * Sets the cost range filter and displays the changes.
   * @param min Minimum cost.
   * @param max Maximum cost.
   * @timecomplexity O(1), O(log n) or O(n) because of update final.
   */
  public setCostRange(min: number | null, max: number | null): void {
    this.costMin = min;
    this.costMax = max;
    this.updateFinal();
  }

  /**
   * Sets the review range filter and displays the results.
   * @param min Minimum review.
   * @param max Maximum review.
   * @timecomplexity O(1), O(log n) or O(n) because of update final.
   */
  public setReviewRange(min: number | null, max: number | null): void {
    this.reviewMin = min;
    this.reviewMax = max;
    this.updateFinal();
  }

  /**
   * Sets the sort order of the results and displays the changes.
   * @param newSort The new sort order type.
   * @timecomplexity O(1), O(log n) or O(n) because of update final.
   */
  public changeSort(newSort: SortFieldType): void {
    this.sort = newSort;
    this.updateFinal();
  }

  /**
   * Toggles the sort order between ascending and descending.
   * @timecomplexity O(n), where n is the page size
   */
  public toggleDirection(): void {
    this.descending = !this.descending; // Toggle the order
    this.displayUpdate(); // Reload results based on the new order
  }

  /**
   * Changes the number of results displayed per page. Clamps the value to be between 1 and 100
   * @param {number} n The new page size
   * @timecomplexity O(n), where n is the page size
   */
  public changePageSize(n: number): void {
    this.pageSize = clamp(
      n,
      SearchResult.MIN_PAGE_SIZE,
      SearchResult.MAX_PAGE_SIZE
    ); // Update page size
    this.updatePageCount();
    this.displayUpdate();
  }

  /**
   * Increments or decrements the current page by a specified amount, wrapping around as necessary.
   * @param amount The amount to change the page by (can be negative).
   * @timecomplexity O(1)
   */
  public incrementPage(amount: number): void {
    this.page = circleMod(this.page + amount, this.pageCount); // Update page with circular behavior
    this.displayUpdate(); // Update page info
  }

  /**
   * Sets the current page to a specified number, clamping the value to valid page indices.
   * @param n The new page number.
   * @timecomplexity O(1)
   */
  public setPage(n: number): void {
    n = clamp(n - 1, 0, this.pageCount - 1); // Ensure n is within valid range.

    this.page = n; // Update the current page.
    this.displayUpdate(); // Update page info display.
  }

  /**
   * Updates the page count based on the amount of results.
   * @timecomplexity O(1)
   */
  public updatePageCount(): void {
    this.page = 0;
    this.pageCount = Math.ceil(this.finalCount / this.pageSize);
  }

  /**
   * Updates the final array to be displayed in the results page.
   * @timecomplexity O(1), O(log n) or O(n) depending on which sort and filters are being applied.
   */
  public updateFinal(): void {
    let filteredType: any;
    let filteredCost: any;
    let filteredReview: any;

    // make sure steps are skipped if results/any filters are empty
    // optimize and cleanup code (fix stuff with number[] | Uint32Array and make sure everything is Uint32Array from initialization )

    // Set type filtered array if type filter
    if (this.typeFilter !== '') {
      filteredType = this.app.getCuisineTypeArr(this.typeFilter);
    }

    // Set cost filtered array if cost range
    if (this.costMin !== null && this.costMax !== null) {
      filteredCost = filterNumbers(
        this.app.data.cost,
        this.app.sorted.cost,
        this.costMin,
        this.costMax
      );
    }

    // Set review filtered array if review range
    if (this.reviewMin !== null && this.reviewMax !== null) {
      filteredReview = filterNumbers(
        this.app.data.review,
        this.app.sorted.review,
        this.reviewMin,
        this.reviewMax
      );
    }

    const data: (Uint32Array | number[])[] = [];
    let dataPointer: number = 0;
    let sorted: Uint32Array | undefined;

    if (this.sort === 'storeName') {
      data[dataPointer++] = this.results; // Add search results array because it is sorted alphabetically

      if (filteredType) data[dataPointer++] = filteredType;
      if (filteredCost) data[dataPointer++] = filteredCost;
      if (filteredReview) data[dataPointer++] = filteredReview;
    } else if (this.sort === 'cost' && filteredCost) {
      data[dataPointer++] = filteredCost; // Add cost filtered array first because it is sorted by cost
      data[dataPointer++] = this.results;

      if (filteredType) data[dataPointer++] = filteredType;
      if (filteredReview) data[dataPointer++] = filteredReview;
    } else if (this.sort === 'review' && filteredReview) {
      data[dataPointer++] = filteredReview; // Add review filtered array first because it is sorted by review
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

    let final: Uint32Array = this.results;

    if (dataPointer > 1) {
      final = getIntersections(data, App.RESTAURANT_COUNT, sorted);
    } // Set final to intersections if there are any filters
    else if (dataPointer === 1) {
      if (sorted) {
        final = sortBy(data[0], App.RESTAURANT_COUNT, sorted);
      } // Set final to sorted default results if sort is not alphabetical
      else {
        final = new Uint32Array(data[0]);
      } // Set final to default results
    }

    // Set final
    this.final = final;
    this.finalCount = final.length;

    // Display changes
    this.updatePageCount();
    this.displayUpdate();
  }

  /**
   * Creates and displays information for a restaurant result based on its order and index.
   * @param order The order of the result to display.
   * @param index The index of the restaurant in the original data.
   * @timecomplexity O(1)
   */
  public createResultElement(order: number, index: number): void {
    const info: HTMLDivElement = this.app.createRestaurantInfo(index);

    const div: HTMLDivElement = document.createElement('div');
    div.className = 'result-container';

    const resultSpan: HTMLParagraphElement = document.createElement('p');
    resultSpan.innerText = `Result #${order + 1}`;
    resultSpan.className = 'result-title';

    const button: HTMLButtonElement = document.createElement('button');
    button.innerText = 'View On Map';
    button.className = 'result-map-button';
    button.type = 'button';

    div.appendChild(resultSpan);
    div.appendChild(info);
    div.appendChild(button);

    button.addEventListener('click', () => {
      this.app.displayMap.viewRestaurant(index);
    });

    SEARCH_RESULTS.appendChild(div);
  }

  /**
   * Loads the results for the current page and updates the UI.
   * @timecomplexity O(n), where n is the page size.
   */
  public displayUpdate(): void {
    this.app.pageSizeTextbox.setValue(this.pageSize); // Update page size input
    this.app.pageTextbox.setValue(this.page + 1); // Update current page number
    PAGE_COUNT.innerText = String(this.pageCount === 0 ? 1 : this.pageCount); // Display total pages, ensure at least 1

    if (this.descending) {
      SORT_DIRECTION.classList.add('descending');
      SORT_DIR_TEXT.innerText = 'Descending';
    } else {
      SORT_DIRECTION.classList.remove('descending');
      SORT_DIR_TEXT.innerText = 'Ascending';
    }

    SEARCH_RESULTS.innerHTML = ''; // Clear previous results

    // Loop through the number of results per page and load them
    for (let i: number = 0; i < this.pageSize; i++) {
      const change: number = this.page * this.pageSize + i; // Calculate the index for the current result
      const current: number = this.descending
        ? this.finalCount - 1 - change
        : change; // Adjust index based on sort order

      if (current >= this.finalCount || current < 0) break; // Break if current index is out of bounds

      this.createResultElement(current, this.final[current]); // Load the restaurant info
    }
  }
}
