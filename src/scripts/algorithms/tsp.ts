// TODO
// Do get combinations once in the start of the program in index -- PULL AND DO THIS
// Add JSDOC and comments
// Remove all illegal code -- DONE
// I don't like the cuisine const -- PULL AND DO THIS
// Write a helper function -- DONE

const cuisines = [
  "Indian",
  "Coffee",
  "Mexican",
  "Chinese",
  "Burger",
  "Japanese",
  "Italian",
  "Pizza",
  "Korean"
];
/**
 * Gets all combinations of length four from an array 
 * @param {any[]} arr. Our array of strings we want to form combinations with
 * @timecomplexity `O(n!)` We have 4! as a parameter but that is = O(1)
 */
function getCombinations(arr: any[]) {
  const result: any[] = [];
  /**
   * :w
   *
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


type TNode = {
  id: number;   // Unique identifier for the TNode
  x: number;    // X coordinate
  y: number;    // Y coordinate
  type: string; // Type of the TNode
};

type Graph = {
  TNodes: TNode[];
  categories: string[]; // List of categories to visit
};
// Calculate Euclidean distance between two TNodes
function euclideanDistance(TNode1: TNode, TNode2: TNode): number {
  const dx = TNode1.x - TNode2.x;
  const dy = TNode1.y - TNode2.y; return Math.sqrt(dx * dx + dy * dy);
}

// Phase 1: Precompute distances between every pair of TNodes
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

// Phase 2: Find the minimum distance from start to end, visiting at least one TNode of each category
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
  // path.reverse();

  return { distance: minDistance, path };
}
function goFrugal(
  xData: number[],
  yData: number[],
  typesData: string[],
  currentX: number,
  currentY: number,
  combinations: string[][],
  budget: number,
  sortedData: Uint32Array,
  fast: boolean = true
): { distance: number; path: TNode[]; possible: boolean } {
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
    TNodes[i] = { id: i, x: sortedX[i], y: sortedY[i], type: sortedTypes[i] };
  }
  let graph: Graph = {
    TNodes,
    categories: [""]
  };
  const deepCopy = JSON.parse(JSON.stringify(combinations));
  let best = { distance: Infinity, path: [TNodes[0]], possible: false };
  for (let i = 0; i < deepCopy.length; i++) {
    graph = { TNodes, categories: deepCopy[i] }
    graph.categories[graph.categories.length] = "START";
    let result = findMinimumDistanceAnywhere(graph, 0);
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
  return { distance: best.distance, path: best.path, possible: true };


}
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
  // i is 110 becaue I am scared of random bugs when copying over
  for (let i = 0; i < speed + 10; i++) {
    let index = sortedData[i];
    sortedX[i] = xData[index];
    sortedY[i] = yData[index];
    sortedTypes[i] = typesData[index];
  }

  let TNodes: TNode[] = [{ id: 0, x: currentX, y: currentY, type: "START" }];
  for (let i = 1; i < speed; i++) {
    TNodes[i] = { id: i, x: sortedX[i], y: sortedY[i], type: sortedTypes[i] };
  }
  TNodes[speed] = { id: speed, x: targetX, y: targetY, type: "END" }
  let graph: Graph = {
    TNodes,
    categories: deepCopy
  };
  const result = findMinimumDistanceToTypesAndEnd(graph, 0, speed);
  return result;
}