// #region html elements
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

/**
 * Main application class which stores all global information related to the web app.
 */
class App {
  static RESTAURANT_COUNT: number = 100000;
  static UNIT_SCALE: number = 20; // Scale of x and y data units (every increment of 1 represents 20 meters)

  public data: Data; // Holds the original data.
  public sorted: SortedData; // Holds the sorted data.

  public locationX: number = 0; // User's current X location.
  public locationY: number = 0; // User's current Y location.

  public currentSearch: SearchResult; // Holds the current search result.
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

      distData: new Float32Array(App.RESTAURANT_COUNT), // Array for distances.
      distSorted: new Uint32Array(App.RESTAURANT_COUNT), // Array for sorted distances.
    };

    // Creating our components
    this.loadTypes();

    this.locationXTextbox = new ScalingTextbox(LOCATION_X, 0);
    this.locationYTextbox = new ScalingTextbox(LOCATION_Y, 0);

    this.updateDistances();

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
    this.fuelSaveChecklist = new Checklist(SAVE_FUEL_CHECKLIST, this.sorted.cuisines, false, 9);

    // Initialize the current search with store names and an empty query.
    this.currentSearch = new SearchResult(this, this.sorted.storeName);
    this.displayMap = new DisplayMap(this);

    this.initInput(); // Set up input handling for searches.
  }

  /*
   * @timecomplexity O(1)
   */
  public createTypeOption(name: string) {
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
  public getCuisineTypeIndex(cuisineName: string): number {
    for (let i = 0; i < this.sorted.cuisines.length; i++) {
      if (this.sorted.cuisines[i] == cuisineName) return i;
    }

    return -1;
  }

  /**
   * @timecomplexity O(1)
   */
  public getCuisineTypeArr(cuisineName: string): number[] {
    return this.sorted.type[this.getCuisineTypeIndex(cuisineName)];
  }
  /**
   * @timecomplexity O(n)
   */
  public loadTypes() {
    const typePointers: number[] = [];
    let cuisinePointer = 0;

    for (let i = 0; i < App.RESTAURANT_COUNT; i++) {
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
  public updateDistances() {
    this.locationXTextbox.setValue(this.locationX*App.UNIT_SCALE);
    this.locationYTextbox.setValue(this.locationY*App.UNIT_SCALE);
    for (let i = 0; i < App.RESTAURANT_COUNT; i++) {
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
  public changeLocation(x: number, y: number) {
    this.locationX = x; // Update the X location.
    this.locationY = y; // Update the Y location.
    this.displayMap.render();
    this.updateDistances(); // Recalculate distances based on the new location.
  }

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
   * Initializes the input handling for search queries.
   * 
   * @timecomplexity O(1) - Setup tasks for input handling are constant time operations.
   */
  initInput() {
    // TESTING_BUTTON.addEventListener("click", () => {
    //   tests(document.getElementById("testing-div"));
    // });

    const searchCallback = () => {
      const nameInput = SEARCH_NAME_INPUT.value;
      const idInput = SEARCH_ID_INPUT.value;
      const xInput = parseInt(SEARCH_X_INPUT.value)/App.UNIT_SCALE;
      const yInput = parseInt(SEARCH_Y_INPUT.value)/App.UNIT_SCALE;

      if (nameInput == "" && idInput == "" && isNaN(xInput) && isNaN(yInput)) return;

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
          else results = sortBy(total[0], App.RESTAURANT_COUNT, this.sorted.storeName);

      } else if (totalPointer > 1) {
        results = getIntersections(total, App.RESTAURANT_COUNT, alreadySorted ? undefined : this.sorted.storeName);

      } else {
        results = new Uint32Array(0);
      }

      this.currentSearch = new SearchResult(this, results);
      this.displayMap.clearPath();
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

    SEARCH_CLEAR_BUTTON.addEventListener("click", () => {
      SEARCH_NAME_INPUT.value = "";
      SEARCH_ID_INPUT.value = "";
      SEARCH_X_INPUT.value = "";
      SEARCH_Y_INPUT.value = "";

      this.currentSearch = new SearchResult(this, this.sorted.storeName);
      this.displayMap.clearPath();
    });

    TYPE_SELECT.addEventListener("input", () => {
      this.currentSearch.setTypeFilter(TYPE_SELECT.value);
    });

    this.costSlider.addListener((min: number, max: number, fullRange: boolean) => {
      if (fullRange) {
        this.currentSearch.setCostRange(null, null);

        return;
      }

      this.currentSearch.setCostRange(min, max);
    });

    this.reviewSlider.addListener((min: number, max: number, fullRange: boolean) => {
      if (fullRange) {
        this.currentSearch.setReviewRange(null, null);

        return;
      }

      this.currentSearch.setReviewRange(min, max);
    });

    SORT_SELECT.addEventListener("input", () => {
      this.currentSearch.changeSort(SORT_SELECT.value as SortFieldType);
    });

    SORT_DIRECTION.addEventListener("click", () => {
      this.currentSearch.toggleDirection();
    });

    this.pageSizeTextbox.addListener(() => {
      if (this.pageSizeTextbox.value != null) this.currentSearch.changePageSize(this.pageSizeTextbox.value);
    });

    NEXT_PAGE_BUTTON.addEventListener("click", () => {
      this.currentSearch.incrementPage(1);
    });

    PREV_PAGE_BUTTON.addEventListener("click", () => {
      this.currentSearch.incrementPage(-1);
    });

    this.pageTextbox.addListener(() => {
      if (this.pageTextbox.value != null) this.currentSearch.setPage(this.pageTextbox.value);
    });

    let resultCount: number = 0;

    FRUGAL_RESULT.hidden = true;

    FRUGAL_BUTTON.addEventListener("click", () => {
      const destX = this.destXTextbox.value/App.UNIT_SCALE;
      const destY = this.destYTextbox.value/App.UNIT_SCALE;
      const budget = this.budgetTextbox.value;

      const result = goFrugal(
        this.data.x, this.data.y, this.data.type, this.locationX, this.locationY,
        getCombinations(this.sorted.cuisines), budget, this.sorted.distSorted, destX, destY
      );

      const path = result.path;
      const results = new Uint32Array(4);

      for (let i = 0; i < 4; i++) {
        results[i] = path[i + 1].id;
      }

      this.currentSearch = new SearchResult(this, results);
      this.displayMap.setPath(path, result.distance);

      FRUGAL_RESULT.classList.add("show");
      FRUGAL_COST.innerText = "$" + (result.distance*App.UNIT_SCALE/1000*0.5).toFixed(2);
      FRUGAL_SUCCESS.innerText = `Fuel Cost ${result.possible ? "Within" : "Exceeds"} Budget`;

      if (result.possible) FRUGAL_SUCCESS.classList.remove("unsuccessful");
      else FRUGAL_SUCCESS.classList.add("unsuccessful");

      resultCount++;

      window.setTimeout(() => {
        resultCount--;

        if (resultCount == 0) FRUGAL_RESULT.classList.remove("show");
      }, 3000)
    });

    this.fuelSaveChecklist.addListener((value: string[] | null) => {
      if (!value || value.length < 1) SAVE_FUEL_BUTTON.disabled = true;
        else SAVE_FUEL_BUTTON.disabled = false;
    });

    SAVE_FUEL_BUTTON.disabled = true;

    SAVE_FUEL_BUTTON.addEventListener("click", () => {
      const destX = this.destXTextbox.value/App.UNIT_SCALE;
      const destY = this.destYTextbox.value/App.UNIT_SCALE;
      const selected = this.fuelSaveChecklist.value!;

      const result = savingFuel(selected, this.data.x, this.data.y, this.data.type, this.locationX, this.locationY, destX, destY, this.sorted.distSorted);
      const path = result.path;
      const results = [];

      for (let i = 1; i < path.length - 1; i++) {
        results[i] = path[i].id;
      }

      this.currentSearch = new SearchResult(this, new Uint32Array(results));
      this.displayMap.setPath(path, result.distance);
    });

    this.locationXTextbox.addListener(() => {
      const value = this.locationXTextbox.value/App.UNIT_SCALE;

      if (this.locationX == value) return;

      this.locationX = value;

      this.updateDistances();
    });

    this.locationYTextbox.addListener(() => {
      const value = this.locationYTextbox.value/App.UNIT_SCALE;

      if (this.locationY == value) return;

      this.locationY = value;

      this.updateDistances();
    });

    LOCATION_CENTER.addEventListener("click", () => {
      this.displayMap.animateCamera(this.locationX, this.locationY);
    });
  }
}
