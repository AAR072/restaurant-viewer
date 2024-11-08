/**
 * Gets all combinations of length four from an array 
 * @param {any[]} arr. Our array of strings we want to form combinations with
 * @timecomplexity `O(n!)`. This comes from the recursive sub-function
 */
function getCombinations(arr: any[]) {
  const result: any[] = [];
  /**
   * Recursive function that does the combination generation
   * This is a simple backtracking function
   * @timecomplexity `O(n!)`
  */
  const generateCombinations = (start: number, currentCombination: any[], currentPtr = 0, resultPtr = 0) => {
    // Only add combinations of length 4 to the result
    if (currentPtr === 4) {
      result[resultPtr] = [...currentCombination];
      resultPtr++;
      return resultPtr; // Return resultPtr to track next insertion index
    }

    // Loop through the array to generate combinations
    for (let i = start; i < arr.length; i++) {
      currentCombination[currentPtr] = arr[i];
      resultPtr = generateCombinations(i + 1, currentCombination, currentPtr + 1, resultPtr); // Recur with the next index
    }

    return resultPtr;
  };

  generateCombinations(0, []);
  return result;
}

/**
 * The object for a singular node
 *
 * @type {Object} TNode
 * @property {number} id - Unique identifier for the TNode.
 * @property {number} x - X coordinate of the TNode.
 * @property {number} y - Y coordinate of the TNode.
 * @property {string} type - Type of the TNode.
 */
type TNode = {
  id: number;
  x: number;
  y: number;
  type: string;
};

/**
 * The object for the graph made up of nodes
 *
 * @type {Object} Graph
 * @property {TNode]} TNodes - The list of nodes in the graph  
 * @property {string[]} Categories - The list of categories to visit
*/
type Graph = {
  TNodes: TNode[];
  categories: string[];
};

/**
 * Calculates the Euclidean distance between two TNode objects.
 *
 * @param {TNode} TNode1 - The first TNode object.
 * @param {TNode} TNode2 - The second TNode object.
 * @returns {number} The Euclidean distance between the two TNodes.
 * @timecomplexity `O(1)`
 */
function euclideanDistance(TNode1: TNode, TNode2: TNode): number {
  const dx = TNode1.x - TNode2.x;
  const dy = TNode1.y - TNode2.y; return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Computes the pairwise Euclidean distances between all TNode objects in an array.
 *
 * @param {TNode[]} TNodes - Array of TNode objects.
 * @returns {number[][]} A 2D array where the element at  i,j represents the
 * Euclidean distance between TNode at index i and TNode at index j. Distance to
 * itself is zero, and non-connected pairs have a default value of Infinity.
 * @timecomplexity `O(n^2)`, Euclidean distance function that is called inside this function is `O(1)`
 */
function computeAllPairDistances(TNodes: TNode[]): number[][] {
  const n = TNodes.length;
  const dist: number[][] = [];
  for (let i = 0; i < n; i++) {
    dist[i] = [];
    for (let j = 0; j < n; j++) {
      dist[i][j] = Infinity;
    }
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        dist[i][j] = euclideanDistance(TNodes[i], TNodes[j]);
      } else {
        dist[i][j] = 0; // Distance to itself is zero
      }
    }
  }

  return dist;
}

/**
 * Finds the minimum distance and path from a start node to an end node in a graph,
 * visiting at least one node of each specified type (category) along the way.
 *
 * @param {Graph} graph - The graph containing TNodes and categories.
 * @param {number} startId - The ID of the starting TNode.
 * @param {number} endId - The ID of the destination TNode.
 * @returns {{ distance: number, path: TNode[] }} An object containing the minimum
 * distance and the path of TNodes from start to end, visiting all categories.
 * If there is no valid path, returns `Infinity` for the distance and an empty path.
 *
 * @type {Object} Graph
 * @property {TNode[]} TNodes - Array of TNode objects representing graph nodes.
 * @property {string[]} categories - Array of unique category types for TNodes.
 * @timecomplexity `O(n^2 * 2^k)` where n is the number of nodes and k is the number
 * unique categories. Any sub functions are less than or equal to this complexity. 
 */
function findMinimumDistanceToTypesAndEnd(graph: Graph, startId: number, endId: number): { distance: number; path: TNode[] } {
  let pathPtr = 0;
  const { TNodes, categories } = graph;
  const n = TNodes.length;
  const dist = computeAllPairDistances(TNodes);
  const categoryMap: Record<string, number> = {};

  // Map each category to a unique bit
  for (let index = 0; index < categories.length; index++) {
    const category = categories[index];
    categoryMap[category] = 1 << index;
  }

  // DP array to track the minimum distance
  const dp: number[][] = [];
  const previous: number[][] = [];
  for (let i = 0; i < n; i++) {
    dp[i] = [];
    previous[i] = [];
    for (let j = 0; j < (1 << categories.length); j++) {
      dp[i][j] = Infinity;
      previous[i][j] = -1;
    }
  }

  // Start distance is zero, with the start node’s category marked as visited
  const startMask = categoryMap[TNodes[startId].type];
  dp[startId][startMask] = 0;

  // Iterate through all TNodes and category combinations
  for (let mask = 0; mask < (1 << categories.length); mask++) {
    for (let currentTNode = 0; currentTNode < n; currentTNode++) {
      if (dp[currentTNode][mask] < Infinity) {
        // Check each TNode for potential paths
        for (let nextTNode = 0; nextTNode < n; nextTNode++) {
          if (nextTNode !== currentTNode) {
            const nextMask = mask | categoryMap[TNodes[nextTNode].type]; // Update visited categories
            const newDistance = dp[currentTNode][mask] + dist[currentTNode][nextTNode];

            // Check if this new distance is an improvement
            if (newDistance < dp[nextTNode][nextMask]) {
              // Perform the update
              dp[nextTNode][nextMask] = newDistance;
              previous[nextTNode][nextMask] = currentTNode; // Store the previous TNode
            }
          }
        }
      }
    }
  }

  // Find the minimum distance to the specified endId with all categories visited
  const allCategoriesMask = (1 << categories.length) - 1;
  const minDistance = dp[endId][allCategoriesMask];
  const path: TNode[] = [];

  if (minDistance === Infinity) {
    // If there's no valid path to endId, return empty result
    return { distance: Infinity, path: [] };
  }

  // Build the path by tracing back from endId with all categories visited
  let currentTNode = endId;
  let currentMask = allCategoriesMask;

  while (currentTNode !== -1) {
    path[pathPtr] = TNodes[currentTNode];
    pathPtr++;
    const prevTNode = previous[currentTNode][currentMask];
    currentMask &= ~categoryMap[TNodes[currentTNode].type]; // Remove the category from mask
    currentTNode = prevTNode;
  }

  // Reverse the path to get it from start to end
  for (let i = 0, j = path.length - 1; i < j; i++, j--) {
    const temp = path[i];
    path[i] = path[j];
    path[j] = temp;
  }

  return { distance: minDistance, path };
}

/**
 * Finds the minimum distance and path from a start node to any node in the graph,
 * visiting at least one node of each specified category type along the way.
 *
 * @param {Graph} graph - The graph containing TNodes and categories.
 * @param {number} startId - The ID of the starting TNode.
 * @returns {{ distance: number, path: TNode[] }} An object containing the minimum
 * distance and the path of TNodes starting from the start node and ending at any
 * node, visiting all categories. If there is no valid path, returns `Infinity`
 * for the distance and an empty path.
 *
 * @type {Object} Graph
 * @property {TNode[]} TNodes - Array of TNode objects representing graph nodes.
 * @property {string[]} categories - Array of unique category types for TNodes.
 * @timecomplexity `O(n^2 * 2^k)` where n is the number of nodes and k is the number
 * unique categories. Any sub functions are less than or equal to this complexity. 
 */
function findMinimumDistanceAnywhere(graph: Graph, startId: number): { distance: number; path: TNode[] } {
  let ptr = 0;
  const { TNodes, categories } = graph;
  const n = TNodes.length;
  const dist = computeAllPairDistances(TNodes);
  const categoryMap: Record<string, number> = {};

  // Map each category to a unique bit
  categories.forEach((category, index) => {
    categoryMap[category] = 1 << index;
  });

  // DP array to track the minimum distance
  const dp: number[][] = [];
  for (let i = 0; i < n; i++) {
    dp[i] = [];
    for (let j = 0; j < (1 << categories.length); j++) {
      dp[i][j] = Infinity;
    }
  }

  const previous: number[][] = [];
  for (let i = 0; i < n; i++) {
    previous[i] = [];
    for (let j = 0; j < (1 << categories.length); j++) {
      previous[i][j] = -1;
    }
  }

  // Start with the start node's category marked as visited
  const startMask = categoryMap[TNodes[startId].type];
  dp[startId][startMask] = 0;

  // Iterate through all TNodes and category combinations
  for (let mask = 0; mask < (1 << categories.length); mask++) {
    for (let currentTNode = 0; currentTNode < n; currentTNode++) {
      if (dp[currentTNode][mask] < Infinity) {
        // Check each TNode for potential paths
        for (let nextTNode = 0; nextTNode < n; nextTNode++) {
          if (nextTNode !== currentTNode) {
            const nextMask = mask | categoryMap[TNodes[nextTNode].type]; // Update visited categories
            const newDistance = dp[currentTNode][mask] + dist[currentTNode][nextTNode];
            // Update dp and previous arrays
            if (newDistance < dp[nextTNode][nextMask]) {
              dp[nextTNode][nextMask] = newDistance;
              previous[nextTNode][nextMask] = currentTNode; // Store the previous TNode
            }
          }
        }
      }
    }
  }

  // Find the minimum distance to any TNode with all categories visited
  const allCategoriesMask = (1 << categories.length) - 1;
  let minDistance = Infinity;
  let lastTNodeId = -1;

  for (let currentTNode = 0; currentTNode < n; currentTNode++) {
    if (dp[currentTNode][allCategoriesMask] < minDistance) {
      minDistance = dp[currentTNode][allCategoriesMask];
      lastTNodeId = currentTNode;
    }
  }

  // Build the path by tracing back from the last TNode with all categories visited
  const path: TNode[] = [];
  let currentMask = allCategoriesMask;

  while (lastTNodeId !== -1) {
    path[ptr] = TNodes[lastTNodeId];
    ptr++;
    const prevTNode = previous[lastTNodeId][currentMask];
    currentMask &= ~categoryMap[TNodes[lastTNodeId].type]; // Remove the category from mask
    lastTNodeId = prevTNode;
  }

  // Reverse the path to get it from start to end
  ptr = 0;
let temp;
  for (let i = 0; i < path.length / 2; i++) {
    temp = path[i];
    path[i] = path[path.length - 1 - i];
    path[path.length - 1 - i] = temp;
  }
  // path.reverse();

  return { distance: minDistance, path };
}

/**
 * Determines the shortest path within a budget that visits required combinations of types.
 * Uses either a fast or slower search speed depending on the `fast` flag.
 *
 * @param {number[]} xData - Array of x-coordinates for all data points.
 * @param {number[]} yData - Array of y-coordinates for all data points.
 * @param {string[]} typesData - Array of types corresponding to each data point.
 * @param {number} currentX - The starting x-coordinate.
 * @param {number} currentY - The starting y-coordinate.
 * @param {string[][]} combinations - Array of required type combinations to visit.
 * @param {number} budget - Maximum allowable distance (in kilometers) the path can cover.
 * @param {Uint32Array} sortedData - Sorted indices array to order `xData`, `yData`, and `typesData`.
 * @param {number} endingX - Target X position
 * @param {number} endingY - Target Y position
 * @param {boolean} [fast=true] - Flag to determine search speed; `true` for fast, `false` for slower.
 * @returns {{ distance: number, path: TNode[], possible: boolean }} An object with:
 * - `distance`: The shortest distance covered by the path (in arbitrary units).
 * - `path`: Array of `TNode` objects representing the path nodes.
 * - `possible`: Boolean indicating if a path within the budget was found.
 *
 * @type {Object} TNode
 * @property {number} id - Unique identifier for the TNode.
 * @property {number} x - X coordinate.
 * @property {number} y - Y coordinate.
 * @property {string} type - Type of the TNode.
 *
 * @type {Object} Graph
 * @property {TNode[]} TNodes - Array of TNode objects representing graph nodes.
 * @property {string[]} categories - Array of unique category types for TNodes.
 * @timecomplexity `O(c * m)` where c is the number of combinations and m is the time complexity of the `findMinimumDistanceAnywhere` function.
 */
function goFrugal(
  xData: number[],
  yData: number[],
  typesData: string[],
  currentX: number,
  currentY: number,
  combinations: string[][],
  budget: number,
  sortedData: Uint32Array,
  endingX: number,
  endingY: number,
  fast: boolean = true
): { distance: number; path: TNode[]; possible: boolean } {
  const t0 = performance.now();
  const sortedX: number[] = [];
  const sortedY: number[] = [];
  let speed;
  if (fast) {
    speed = 100;
  } else {
    speed = 500;
  }

  const sortedTypes: string[] = [];
  for (let i = 0; i < speed + 10; i++) {
    let index = sortedData[i];
    sortedX[i] = xData[index];
    sortedY[i] = yData[index];
    sortedTypes[i] = typesData[index];
  }


  let TNodes: TNode[] = [{ id: 0, x: currentX, y: currentY, type: "START" }];
  for (let i = 1; i < speed; i++) {
    TNodes[i] = { id: i, x: sortedX[i-1], y: sortedY[i-1], type: sortedTypes[i-1] };
  }
  TNodes[speed] = { id: speed, x: endingX, y: endingY, type: "END" };
  let graph: Graph = {
    TNodes,
    categories: [""]
  };
  const deepCopy = JSON.parse(JSON.stringify(combinations));
  let best = { distance: Infinity, path: [TNodes[0]], possible: false };
  for (let i = 0; i < deepCopy.length; i++) {
    graph = { TNodes, categories: deepCopy[i] }
    graph.categories[graph.categories.length] = "START";
    let result = findMinimumDistanceToTypesAndEnd(graph, 0, speed);
    if (result.distance < best.distance) {
      best.path = result.path;
      best.distance = result.distance;
    }
  }
  if (best.distance == Infinity) {
    return { distance: Infinity, path: [], possible: false };
  }
  let distanceInKm = best.distance / 50;
  if (distanceInKm >= budget * 2) {
    return { distance: best.distance, path: best.path, possible: false };
  }
  const t1 = performance.now();
  logTask("Go Frugal", t1 - t0, `Found the best restaurants when starting at (${currentX}, ${currentY}).`);
  return { distance: best.distance, path: best.path, possible: true };
}

/**
 * Finds the minimum distance and path from the current location to a target location,
 * visiting nodes in a sorted order of data points, while considering multiple categories.
 *
 * @param {string[]} categories - An array of category names. The "START" and "END" categories will be added to this list.
 * @param {number[]} xData - An array of X coordinates for the data points.
 * @param {number[]} yData - An array of Y coordinates for the data points.
 * @param {string[]} typesData - An array of category types for each data point.
 * @param {number} currentX - The X coordinate of the current location (starting point).
 * @param {number} currentY - The Y coordinate of the current location (starting point).
 * @param {number} targetX - The X coordinate of the target location (ending point).
 * @param {number} targetY - The Y coordinate of the target location (ending point).
 * @param {Uint32Array} sortedData - An array of indices representing the sorted data points based on some criteria.
 * @param {boolean} [fast=true] - A flag that controls the number of nodes to consider for the search. If `true`, it uses 100 nodes, otherwise 500.
 *
 * @returns {{ distance: number; path: TNode[] }} - An object containing the minimum distance and the path (in terms of nodes) from the start to the end.
 * - `distance`: The shortest distance calculated from the current location to the target, considering the sorted nodes and categories.
 * - `path`: An array of `TNode` objects representing the sequence of nodes visited along the path.
 *
 * @timecomplexity `O(m)` where m is the time complexity of the `findMinimumDistanceToTypesAndEnd` function.
 */
function savingFuel(
  categories: string[],
  xData: number[],
  yData: number[],
  typesData: string[],
  currentX: number,
  currentY: number,
  targetX: number,
  targetY: number,
  sortedData: Uint32Array,
  fast: boolean = true
): { distance: number; path: TNode[] } {
  const t0 = performance.now();
  const sortedX = [];
  const sortedY = [];
  const sortedTypes = [];
  const deepCopy = JSON.parse(JSON.stringify(categories));
  deepCopy[deepCopy.length] = "START";
  deepCopy[deepCopy.length] = "END";
  let speed;
  if (fast) {
    speed = 100;
  } else {
    speed = 500
  }
  // i is 110 because I am scared of random bugs when copying over
  for (let i = 0; i < speed + 10; i++) {
    let index = sortedData[i];
    sortedX[i] = xData[index];
    sortedY[i] = yData[index];
    sortedTypes[i] = typesData[index];
  }
  let TNodes: TNode[] = [{ id: 0, x: currentX, y: currentY, type: "START" }];
  for (let i = 1; i < speed; i++) {
    TNodes[i] = { id: i, x: sortedX[i-1], y: sortedY[i-1], type: sortedTypes[i-1] };
  }
  TNodes[speed] = { id: speed, x: targetX, y: targetY, type: "END" }
  let graph: Graph = {
    TNodes,
    categories: deepCopy
  };
  const result = findMinimumDistanceToTypesAndEnd(graph, 0, speed);
  const t1 = performance.now();
  logTask("Saving Fuel", t1 - t0, `Found the best restaurants when starting at (${currentX}, ${currentY}) and ending at (${targetX}, ${targetY}).`);
  return result;
}
