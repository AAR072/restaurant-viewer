// We link all our html elements here.
// #region html elements
const SEARCH_NAME_INPUT = document.getElementById("search-name") as HTMLInputElement;
const SEARCH_ID_INPUT = document.getElementById("search-id") as HTMLInputElement;
const SEARCH_X_INPUT = document.getElementById("search-x") as HTMLInputElement;
const SEARCH_Y_INPUT = document.getElementById("search-y") as HTMLInputElement;
const SEARCH_BUTTON = document.getElementById("search-button") as HTMLButtonElement;
const SEARCH_CLEAR_BUTTON = document.getElementById("search-clear") as HTMLButtonElement;

const TYPE_SELECT = document.getElementById("type-filter") as HTMLSelectElement;

const SORT_SELECT = document.getElementById("sort-select") as HTMLSelectElement;
const SORT_DIRECTION = document.getElementById("sort-direction") as HTMLButtonElement;

const PAGE_SIZE_INPUT = document.getElementById("page-size") as HTMLInputElement;
const NEXT_PAGE_BUTTON = document.getElementById("next-page") as HTMLButtonElement;
const PREV_PAGE_BUTTON = document.getElementById("prev-page") as HTMLButtonElement;
const PAGE_NUMBER_INPUT = document.getElementById("page-number-input") as HTMLInputElement;
const PAGE_COUNT = document.getElementById("page-count") as HTMLSpanElement;
// #endregion

// Our database after it is sorted
interface SortedData {
  ID: Uint32Array; // Sorted array of IDs.
  storeName: Uint32Array; // Sorted array of store names.
  cuisines: string[];
  type: number[][]; // Dictionary to hold types and their corresponding indices.
  cost: Uint32Array; // Sorted array of costs.
  review: Uint32Array; // Sorted array of reviews.
  x: Uint32Array; // Sorted array of x coordinates.
  y: Uint32Array; // Sorted array of y coordinates.

  distData: Float32Array; // Array to hold calculated distances.
  distSorted: Uint32Array; // Sorted array of distances.
}

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
  static gridScale: number = 20;

  public data: Data; // Holds the original data.
  public sorted: SortedData; // Holds the sorted data.

  public locationX: number = 0; // User's current X location.
  public locationY: number = 0; // User's current Y location.

  public currentSearch: SearchResult; // Holds the current search result.
  public displayMap: DisplayMap;

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
      cuisines: [],
      type: [], // Initialize type dictionary.
      cost: sortNumbers(data.cost), // Sort costs.
      review: sortNumbers(data.review), // Sort reviews.
      x: sortNumbers(data.x), // Sort x coordinates.
      y: sortNumbers(data.y), // Sort y coordinates.

      distData: new Float32Array(App.restaurantCount), // Array for distances.
      distSorted: new Uint32Array(App.restaurantCount), // Array for sorted distances.
    };

    this.loadTypes();

    // Calculate and update distances based on current location.
    this.updateDistances();

    // Initialize the current search with store names and an empty query.
    this.currentSearch = new SearchResult(this, this.sorted.storeName);
    this.displayMap = new DisplayMap(this);

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

  getCuisineTypeIndex(cuisineName: string): number {
    for (let i = 0; i < this.sorted.cuisines.length; i++) {
      if (this.sorted.cuisines[i] == cuisineName) return i;
    }

    return -1;
  }

  getCuisineTypeArr(cuisineName: string): number[] {
    return this.sorted.type[this.getCuisineTypeIndex(cuisineName)];
  }

  loadTypes() {
    const typePointers: number[] = [];
    let cuisinePointer = 0;

    for (let i = 0; i < App.restaurantCount; i++) {
      const index = this.sorted.storeName[i]; // Get the original index of the restaurant from the sorted store names.
      const type = this.data.type[index]; // Retrieve the type of the restaurant using the index.
      let typeIndex = this.getCuisineTypeIndex(type);

      // If the type doesn't exist in the sorted type object, initialize it as an empty array.
      if (typeIndex < 0) {
        typeIndex = cuisinePointer++;

        this.sorted.type[typeIndex] = [];
        typePointers[typeIndex] = 0;

        this.sorted.cuisines[typeIndex] = type;

        this.createTypeOption(type);
      }

      // Store the original index of the restaurant under its type in the sorted structure.
      this.sorted.type[typeIndex][typePointers[typeIndex]++] = index;
    }
  }

  /**
   * Updates distances based on the current location.
   * 
   * @timecomplexity O(n) - The distance calculation iterates over the list of restaurants, resulting in a linear time complexity.
   */
  updateDistances() {
    for (let i = 0; i < App.restaurantCount; i++) {
      this.sorted.distData[i] = getDistance(this.locationX, this.locationY, data.x[i], data.y[i]);
    }

    sortNumbers(this.sorted.distData, this.sorted.distSorted);
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
    SEARCH_BUTTON.addEventListener("click", () => {
      const nameInput = SEARCH_NAME_INPUT.value;
      const idInput = SEARCH_ID_INPUT.value;
      const xInput = parseInt(SEARCH_X_INPUT.value);
      const yInput = parseInt(SEARCH_Y_INPUT.value);

      const total: Uint32Array[] = [];
      let totalPointer = 0;
      let alreadySorted = false;

      if (nameInput != "") {
        total[totalPointer++] = filterStrings(this.data.storeName, this.sorted.storeName, nameInput);
        alreadySorted = true;
      }

      if (idInput != "") total[totalPointer++] = filterStrings(this.data.ID, this.sorted.ID, idInput);
      if (!isNaN(xInput)) total[totalPointer++] = filterNumbers(this.data.x, this.sorted.x, xInput, xInput);
      if (!isNaN(yInput)) total[totalPointer++] = filterNumbers(this.data.y, this.sorted.y, yInput, yInput);

      let results

      if (totalPointer == 1) {
        if (alreadySorted) results = total[0];
        else results = sortBy(total[0], App.restaurantCount, this.sorted.storeName);

      } else if (totalPointer > 1) {
        results = getIntersections(total, App.restaurantCount, alreadySorted ? undefined : this.sorted.storeName);

      } else {
        results = new Uint32Array(0);
      }

      this.currentSearch = new SearchResult(this, results);
    });
          SEARCH_CLEAR_BUTTON.addEventListener("click", () => {
        this.currentSearch = new SearchResult(this, this.sorted.storeName);
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

    const changePageSize = () => {
      let input = Number(PAGE_SIZE_INPUT.value);

      if (!isNaN(input)) this.currentSearch.changePageSize(input);
    }

    PAGE_SIZE_INPUT.addEventListener("keypress", (event: KeyboardEvent) => {
      if (event.key == "Enter") changePageSize();
    });

    PAGE_SIZE_INPUT.addEventListener("blur", () => {
      changePageSize();
    })

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