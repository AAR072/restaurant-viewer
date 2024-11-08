// #region HTML elements
const SEARCH_NAME_INPUT = document.getElementById("search-name") as HTMLInputElement;
const SEARCH_ID_INPUT = document.getElementById("search-id") as HTMLInputElement;
const SEARCH_X_INPUT = document.getElementById("search-x") as HTMLInputElement;
const SEARCH_Y_INPUT = document.getElementById("search-y") as HTMLInputElement;
const SEARCH_BUTTON = document.getElementById("search-button") as HTMLButtonElement;
const SEARCH_CLEAR_BUTTON = document.getElementById("search-clear") as HTMLButtonElement;

const TYPE_SELECT = document.getElementById("type-filter") as HTMLSelectElement;
const COST_RANGE = document.getElementById("cost-range") as HTMLDivElement;
const REVIEW_RANGE = document.getElementById("review-range") as HTMLDivElement;

const SORT_SELECT = document.getElementById("sort-select") as HTMLSelectElement;
const SORT_DIRECTION = document.getElementById("sort-direction") as HTMLButtonElement;

const PAGE_SIZE_SPAN = document.getElementById("page-size") as HTMLSpanElement;
const NEXT_PAGE_BUTTON = document.getElementById("next-page") as HTMLButtonElement;
const PREV_PAGE_BUTTON = document.getElementById("prev-page") as HTMLButtonElement;
const PAGE_NUMBER_SPAN = document.getElementById("page-number-input") as HTMLSpanElement;
const PAGE_COUNT = document.getElementById("page-count") as HTMLSpanElement;

const PATH_DROPDOWN = document.getElementById("path-dropdown") as HTMLDivElement;
const FILTER_DROPDOWN = document.getElementById("filter-dropdown") as HTMLDivElement;

const DESTINATION_X = document.getElementById("path-dest-x") as HTMLSpanElement;
const DESTINATION_Y = document.getElementById("path-dest-y") as HTMLSpanElement;

const FRUGAL_BUDGET_SPAN = document.getElementById("frugal-budget") as HTMLSpanElement;
const FRUGAL_BUTTON = document.getElementById("frugal-button") as HTMLButtonElement;
const FRUGAL_RESULT = document.getElementById("frugal-result") as HTMLDivElement;
const FRUGAL_COST = document.getElementById("frugal-cost") as HTMLSpanElement;
const FRUGAL_SUCCESS = document.getElementById("frugal-success") as HTMLSpanElement;

const SAVE_FUEL_CHECKLIST = document.getElementById("save-fuel-checklist") as HTMLDivElement;
const SAVE_FUEL_BUTTON = document.getElementById("save-fuel-button") as HTMLButtonElement;

const LOCATION_X = document.getElementById("location-x") as HTMLSpanElement;
const LOCATION_Y = document.getElementById("location-y") as HTMLSpanElement;
const LOCATION_CENTER = document.getElementById("location-center") as HTMLButtonElement;

const TESTING_BUTTON = document.getElementById("testing-button") as HTMLButtonElement;
const TESTING_DIV = document.getElementById("testing-div") as HTMLDivElement;
// #endregion

/**
 * Stores all sorted/mutated data
 * 
 */
interface SortedData {
  ID: Uint32Array; // Sorted array of IDs.
  storeName: Uint32Array; // Sorted array of store names.
  cuisines: string[]; // The various cuisine types
  type: number[][]; // Parallel to the cuisines array, stores the indices that correspond to each cuisine type
  cost: Uint32Array; // Sorted array of costs.
  review: Uint32Array; // Sorted array of reviews.
  x: Uint32Array; // Sorted array of x coordinates.
  y: Uint32Array; // Sorted array of y coordinates.

  distData: Float32Array; // Stores all calculated distances based on x and y data
  distSorted: Uint32Array; // Stores sorted distances
}

/** Main application class which stores all global information related to the web app. */
class App {
  static RESTAURANT_COUNT: number = 100000;
  /** Scale of x and y data units (every increment of 1 represents 20 meters). */
  static UNIT_SCALE: number = 20;

  public data: Data; // Holds the original data
  public sorted: SortedData; // Holds the sorted data

  /** User's x location. */
  public locationX: number = 0;
  /** User's y location. */
  public locationY: number = 0;

  /** Search result instance to display results. */
  public searchResult: SearchResult;
  /** Display map instance to display map. */
  public displayMap: DisplayMap;

  public pathDropdown: Dropdown;
  public filterDropdown: Dropdown;

  public costSlider: DoubleSlider;
  public reviewSlider: DoubleSlider;

  public pageSizeTextbox: ScalingTextbox;
  public pageTextbox: ScalingTextbox;

  public destXTextbox: ScalingTextbox;
  public destYTextbox: ScalingTextbox;
  public budgetTextbox: ScalingTextbox;
  public fuelSaveChecklist: Checklist;

  public locationXTextbox: ScalingTextbox;
  public locationYTextbox: ScalingTextbox;

  /**
   * Initializes the App with the given data and sorts it accordingly.
   *
   * @param data - The data to be processed and sorted.
   * 
   * @timecomplexity O(n log n) - Sorting operations for each sortable field use merge sort, which has a time complexity of O(n log n). The initialization of the sorted object involves multiple sorts.
   */
  constructor(data: Data) {
    this.data = data; // Store the original data

    // Initialize the sorted data with sorted arrays and corresponding order arrays
    this.sorted = {
      ID: sortStrings(data.ID), // Sort IDs
      storeName: sortStrings(data.storeName), // Sort store names
      cuisines: [], // Array for cuisine types
      type: [], // 2d array for restaurants for each cuisine type
      cost: sortNumbers(data.cost), // Sort costs
      review: sortNumbers(data.review), // Sort reviews
      x: sortNumbers(data.x), // Sort x coordinates
      y: sortNumbers(data.y), // Sort y coordinates

      distData: new Float32Array(App.RESTAURANT_COUNT), // Array for distances
      distSorted: new Uint32Array(App.RESTAURANT_COUNT), // Array for sorted distances
    };

    this.loadTypes(); // Load cuisine type arrays

    // Create location textboxes
    this.locationXTextbox = new ScalingTextbox(LOCATION_X, 0);
    this.locationYTextbox = new ScalingTextbox(LOCATION_Y, 0);

    this.updateDistances(); // Set and sort distances

    // Create all custom functionality UI components

    this.pathDropdown = new Dropdown(PATH_DROPDOWN);
    this.filterDropdown = new Dropdown(FILTER_DROPDOWN);

    this.costSlider = new DoubleSlider(COST_RANGE,
      this.data.cost[this.sorted.cost[0]],
      this.data.cost[this.sorted.cost[App.RESTAURANT_COUNT - 1]],
      2
    );

    this.reviewSlider = new DoubleSlider(REVIEW_RANGE,
      this.data.review[this.sorted.review[0]],
      this.data.review[this.sorted.review[App.RESTAURANT_COUNT - 1]],
      1
    );

    this.pageSizeTextbox = new ScalingTextbox(PAGE_SIZE_SPAN, 0);
    this.pageTextbox = new ScalingTextbox(PAGE_NUMBER_SPAN, 0);

    this.destXTextbox = new ScalingTextbox(DESTINATION_X, 0, 0);
    this.destYTextbox = new ScalingTextbox(DESTINATION_Y, 0, 0);
    this.budgetTextbox = new ScalingTextbox(FRUGAL_BUDGET_SPAN, 0, 10);
    this.fuelSaveChecklist = new Checklist(SAVE_FUEL_CHECKLIST, this.sorted.cuisines, false, 6);

    // Initialize the search result and display map instances
    this.searchResult = new SearchResult(this);
    this.displayMap = new DisplayMap(this);

    this.initInput(); // Set up input handling for searches
  }

  /**
   * Creates an option in the type filter select element.
   * @param name The name of the option.
   * @timecomplexity O(1)
   */
  private createTypeOption(name: string) {
    const option = document.createElement("option");
    option.innerText = name;
    option.value = name;

    TYPE_SELECT.appendChild(option);
  }

  /**
   * Gets the index of the cuisine name.
   * @param cuisineName The name of the cuisine type.
   * @returns The index of the cuisine type in the cuisines array, -1 if it does not exist.
   * @timecomplexity O(n), where n is the number of cuisines which is always constant so O(1)
   */
  public getCuisineTypeIndex(cuisineName: string): number {
    for (let i = 0; i < this.sorted.cuisines.length; i++) {
      if (this.sorted.cuisines[i] == cuisineName) return i;
    }

    return -1;
  }

  /**
   * Gets the array of restaurants which have a common cuisine type.
   * @returns The array of restaurants for a cuisine type.
   * @timecomplexity O(1)
   */
  public getCuisineTypeArr(cuisineName: string): number[] {
    return this.sorted.type[this.getCuisineTypeIndex(cuisineName)];
  }

  /**
   * Loops through the restaurants, creates the cuisine types and sorts restaurants into a 2d array based on cuisine type.
   * @timecomplexity O(n)
   */
  public loadTypes() {
    const typePointers: number[] = [];
    let cuisinePointer = 0;

    for (let i = 0; i < App.RESTAURANT_COUNT; i++) {
      const index = this.sorted.storeName[i]; // Get the original index of the restaurant from the sorted store names
      const type = this.data.type[index]; // Retrieve the type of the restaurant using the index
      let typeIndex = this.getCuisineTypeIndex(type);

      // If the type doesn't exist in the sorted type object, initialize it as an empty array
      if (typeIndex < 0) {
        typeIndex = cuisinePointer++;

        this.sorted.type[typeIndex] = [];
        typePointers[typeIndex] = 0;

        this.sorted.cuisines[typeIndex] = type;

        this.createTypeOption(type);
      }

      // Store the original index of the restaurant under its type in the sorted structure
      this.sorted.type[typeIndex][typePointers[typeIndex]++] = index;
    }
  }

  /**
   * Updates distances and sorted distances based on the current user location.
   * @timecomplexity O(n log n) - Sorting at the end has O(n log n) time complexity.
   */
  public updateDistances() {
    // Update location textboxes with new location values
    this.locationXTextbox.setValue(this.locationX*App.UNIT_SCALE);
    this.locationYTextbox.setValue(this.locationY*App.UNIT_SCALE);

    // Calculate distances for all restaurants
    for (let i = 0; i < App.RESTAURANT_COUNT; i++) {
      this.sorted.distData[i] = getDistance(this.locationX, this.locationY, data.x[i], data.y[i]);
    }

    sortNumbers(this.sorted.distData, this.sorted.distSorted); // Sort new distances
  }

  /**
   * Changes the user's current location to the specified coordinates (x, y).
   * This method updates the location and recalculates distances to restaurants.
   *
   * @param x - The new X coordinate of the user's location.
   * @param y - The new Y coordinate of the user's location.
   * 
   * @timecomplexity O(n log n) - The method updates the location and calls `updateDistance()` which has O(n log n) time complexity.
   */
  public changeLocation(x: number, y: number) {
    this.locationX = x; // Update the X location.
    this.locationY = y; // Update the Y location.
    this.displayMap.render();
    this.updateDistances(); // Recalculate distances based on the new location.
  }

  /**
   * Universal function for creating a div with all restaurant info for a given restaurant index.
   * @param index The restaurant index.
   * @returns The new info div containing all of the restaurant info.
   * @timecomplexity O(1)
   */
  public createRestaurantInfo(index: number) {
    const div = document.createElement("div");

    const idSpan = document.createElement("p");
    idSpan.innerHTML = `<strong>ID:</strong> ${this.data.ID[index]}`;

    const nameSpan = document.createElement("p");
    nameSpan.innerHTML = `<strong>Name:</strong> ${this.data.storeName[index]}`;

    const typeSpan = document.createElement("p");
    typeSpan.innerHTML = `<strong>Type:</strong> ${this.data.type[index]}`;

    const costSpan = document.createElement("p");
    costSpan.innerHTML = `<strong>Cost:</strong> $${this.data.cost[index].toFixed(2)}`;
    costSpan.className = "cost-color";

    const reviewSpan = document.createElement("p");
    reviewSpan.innerHTML = `<strong>Review:</strong> &#9733;${this.data.review[index].toFixed(1)}`;
    reviewSpan.className = "review-color";

    const positionSpan = document.createElement("p");
    positionSpan.innerHTML = `<strong>Position:</strong> (${this.data.x[index] * App.UNIT_SCALE}m, ${this.data.y[index] * App.UNIT_SCALE}m)`;

    div.appendChild(idSpan);
    div.appendChild(nameSpan);
    div.appendChild(typeSpan);
    div.appendChild(costSpan);
    div.appendChild(reviewSpan);
    div.appendChild(positionSpan);

    return div;
  }

  /**
   * Initializes all the event listeners and HTML element related inputs for the app.
   * @timecomplexity O(1) - Setup tasks for input handling are constant time operations.
   */
  private initInput() {
    // Update search results when search button is pressed

    const searchCallback = () => {
      const nameInput = SEARCH_NAME_INPUT.value;
      const idInput = SEARCH_ID_INPUT.value;
      const xInput = parseInt(SEARCH_X_INPUT.value)/App.UNIT_SCALE;
      const yInput = parseInt(SEARCH_Y_INPUT.value)/App.UNIT_SCALE;

      if (nameInput == "" && idInput == "" && isNaN(xInput) && isNaN(yInput)) return;

      this.searchResult.setSearch(nameInput, idInput, xInput, yInput);
      this.displayMap.clearPath();
      FRUGAL_RESULT.classList.remove("show");
    }

    SEARCH_BUTTON.addEventListener("click", searchCallback);

    SEARCH_NAME_INPUT.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key == "Enter") searchCallback();
    });

    SEARCH_NAME_INPUT.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key == "Enter") searchCallback();
    });

    SEARCH_NAME_INPUT.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key == "Enter") searchCallback();
    });

    // Clear search results to show all results when button pressed
    SEARCH_CLEAR_BUTTON.addEventListener("click", () => {
      SEARCH_NAME_INPUT.value = "";
      SEARCH_ID_INPUT.value = "";
      SEARCH_X_INPUT.value = "";
      SEARCH_Y_INPUT.value = "";

      this.searchResult.clearSearch();
      this.displayMap.clearPath();
      FRUGAL_RESULT.classList.remove("show");
    });

    // Filter search result cuisine type
    TYPE_SELECT.addEventListener("input", () => {
      this.searchResult.setTypeFilter(TYPE_SELECT.value);
    });

    // Filter cost by range slider
    this.costSlider.addListener((min: number, max: number, fullRange: boolean) => {
      if (fullRange) {
        this.searchResult.setCostRange(null, null);

        return;
      }

      this.searchResult.setCostRange(min, max);
    });

    // Filter review by range slider
    this.reviewSlider.addListener((min: number, max: number, fullRange: boolean) => {
      if (fullRange) {
        this.searchResult.setReviewRange(null, null);

        return;
      }

      this.searchResult.setReviewRange(min, max);
    });

    // Change selected sort for search result
    SORT_SELECT.addEventListener("input", () => {
      this.searchResult.changeSort(SORT_SELECT.value as SortFieldType);
    });

    // Change sort direction for search result
    SORT_DIRECTION.addEventListener("click", () => {
      this.searchResult.toggleDirection();
    });

    // Change page size
    this.pageSizeTextbox.addListener(() => {
      if (this.pageSizeTextbox.value != null) this.searchResult.changePageSize(this.pageSizeTextbox.value);
    });

    // Go to next page
    NEXT_PAGE_BUTTON.addEventListener("click", () => {
      this.searchResult.incrementPage(1);
    });

    // Go to previous page
    PREV_PAGE_BUTTON.addEventListener("click", () => {
      this.searchResult.incrementPage(-1);
    });

    // Set exact page
    this.pageTextbox.addListener(() => {
      if (this.pageTextbox.value != null) this.searchResult.setPage(this.pageTextbox.value);
    });

    // Go frugal
    FRUGAL_BUTTON.addEventListener("click", () => {
      // Get destination and budget inputs
      const destX = this.destXTextbox.value/App.UNIT_SCALE;
      const destY = this.destYTextbox.value/App.UNIT_SCALE;
      const budget = this.budgetTextbox.value;

      const result = goFrugal(
        this.data.x, this.data.y, this.data.type, this.locationX, this.locationY,
        getCombinations(this.sorted.cuisines), budget, this.sorted.distSorted, destX, destY
      );

      const path = result.path;
      const results = new Uint32Array(4);

      // Add restaurants on path to array
      for (let i = 0; i < path.length - 2; i++) {
        results[i] = path[i + 1].index!;
      }

      this.searchResult.setResults(results); // Set search results to restaurants on path
      this.displayMap.setPath(path, result.distance); // Set path to render on map

      // Display go frugal info

      FRUGAL_RESULT.classList.add("show");
      FRUGAL_COST.innerText = "$" + (result.distance*App.UNIT_SCALE/1000*0.5).toFixed(2);
      FRUGAL_SUCCESS.innerText = `Fuel Cost ${result.possible ? "Within" : "Exceeds"} Budget`;

      if (result.possible) FRUGAL_SUCCESS.classList.remove("unsuccessful");
      else FRUGAL_SUCCESS.classList.add("unsuccessful");
    });

    // Disable saving fuel when 0 types are selected
    this.fuelSaveChecklist.addListener((value: string[] | null) => {
      if (!value || value.length < 1) SAVE_FUEL_BUTTON.disabled = true;
      else SAVE_FUEL_BUTTON.disabled = false;
    });

    SAVE_FUEL_BUTTON.disabled = true;

    // Saving fuel
    SAVE_FUEL_BUTTON.addEventListener("click", () => {
      // Get destination inputs and selected cuisine inputs
      const destX = this.destXTextbox.value/App.UNIT_SCALE;
      const destY = this.destYTextbox.value/App.UNIT_SCALE;
      const selected = this.fuelSaveChecklist.value!;

      const result = savingFuel(selected, this.data.x, this.data.y, this.data.type, this.locationX, this.locationY, destX, destY, this.sorted.distSorted);
      const path = result.path;
      const results = [];

      // Add restaurants on path to array
      for (let i = 1; i < path.length - 1; i++) {
        results[i] = path[i].index!;
      }

      this.searchResult.setResults(new Uint32Array(results)); // Set restaurants on path as search result
      this.displayMap.setPath(path, result.distance); // Set map path to render
    });

    // Change user x location
    this.locationXTextbox.addListener(() => {
      const value = this.locationXTextbox.value/App.UNIT_SCALE;

      if (this.locationX == value) return;

      this.locationX = value;

      this.updateDistances();
    });

    // Change user y location
    this.locationYTextbox.addListener(() => {
      const value = this.locationYTextbox.value/App.UNIT_SCALE;

      if (this.locationY == value) return;

      this.locationY = value;

      this.updateDistances();
    });

    // Center map to user location
    LOCATION_CENTER.addEventListener("click", () => {
      this.displayMap.animateCamera(this.locationX, this.locationY);
    });

    // Do tests
    TESTING_BUTTON.addEventListener("click", () => {
      tests(TESTING_DIV);
    });
  }
}
