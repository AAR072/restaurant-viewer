// TODO
// Do get combinations once in the start of the program in index
// Add JSDOC and comments
// Remove all illegal code
// I don't like the cuisine const
// Write a helper function


// Force sebastian to write the distance sort but correct
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
function getCombinations(arr: any[]) {
  const result: any [] = [];

  const generateCombinations = (start: number, currentCombination: any []) => {
    // Only add combinations of length 4 to the result
    if (currentCombination.length === 4) {
      result.push([...currentCombination]); // Use a copy of currentCombination
      return; // Return early since we only want combinations of length 4
    }

    // Loop through the array to generate combinations
    for (let i = start; i < arr.length; i++) {
      currentCombination.push(arr[i]); // Include the current element
      generateCombinations(i + 1, currentCombination); // Recur with the next index
      currentCombination.pop(); // Backtrack
    }
  };

  generateCombinations(0, []);
  return result;
}



function sortPointsWithTypes(
  xArray: number[],
  yArray: number[],
  typeArray: string[],
  inputPoint: [number, number]
): [number[], number[], string[]] {
  const n = xArray.length;
  const distances = new Array(n);
  const indices = new Array(n);

  // Calculate distances and initialize indices
  for (let i = 0; i < n; i++) {
    distances[i] = Math.sqrt((xArray[i] - inputPoint[0]) ** 2 + (yArray[i] - inputPoint[1]) ** 2);
    indices[i] = i;
  }

  // Merge sort function to sort indices based on distances
  function mergeSort(arr: number[], left: number, right: number): number[] {
    if (left >= right) return [arr[left]];

    const mid = Math.floor((left + right) / 2);
    const leftSorted = mergeSort(arr, left, mid);
    const rightSorted = mergeSort(arr, mid + 1, right);

    return merge(leftSorted, rightSorted);
  }

  function merge(leftArr: number[], rightArr: number[]): number[] {
    const merged = new Array(leftArr.length + rightArr.length);
    let i = 0, j = 0, k = 0;

    // Merge while comparing distances
    while (i < leftArr.length && j < rightArr.length) {
      if (distances[leftArr[i]] <= distances[rightArr[j]]) {
        merged[k] = leftArr[i];
        i++;
      } else {
        merged[k] = rightArr[j];
        j++;
      }
      k++;
    }

    // Copy remaining elements from leftArr if any
    while (i < leftArr.length) {
      merged[k] = leftArr[i];
      i++;
      k++;
    }

    // Copy remaining elements from rightArr if any
    while (j < rightArr.length) {
      merged[k] = rightArr[j];
      j++;
      k++;
    }

    return merged;
  }

  // Sort indices based on distances using merge sort
  const sortedIndices = mergeSort(indices, 0, n - 1);

  // Use sorted indices to create sorted arrays
  const sortedX = new Array(n);
  const sortedY = new Array(n);
  const sortedTypes = new Array(n);

  for (let i = 0; i < n; i++) {
    sortedX[i] = xArray[sortedIndices[i]];
    sortedY[i] = yArray[sortedIndices[i]];
    sortedTypes[i] = typeArray[sortedIndices[i]];
  }

  return [sortedX, sortedY, sortedTypes];
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
  const { TNodes, categories } = graph;
  const n = TNodes.length;
  const dist = computeAllPairDistances(TNodes);
  const categoryMap: Record<string, number> = {};

  // Map each category to a unique bit
  categories.forEach((category, index) => {
    categoryMap[category] = 1 << index;
  });

  // DP array to track the minimum distance
  const dp: number[][] = Array.from({ length: n }, () => Array(1 << categories.length).fill(Infinity));
  const previous: number[][] = Array.from({ length: n }, () => Array(1 << categories.length).fill(-1));

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
    path.push(TNodes[lastTNodeId]);
    const prevTNode = previous[lastTNodeId][currentMask];
    currentMask &= ~categoryMap[TNodes[lastTNodeId].type]; // Remove the category from mask
    lastTNodeId = prevTNode;
  }

  // Reverse the path to get it from start to end
  path.reverse();

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
): { distance: number; path: TNode[]; possible: boolean} {
  const [sortedX, sortedY, sortedTypes] = sortPointsWithTypes(xData, yData, typesData, [currentX,currentY]);
  let TNodes:  TNode[] = [{id: 0, x: currentX, y: currentY, type: "START"}];
  for (let i = 1; i < 100; i++) {
    TNodes[i] = {id: i, x: sortedX[i], y:sortedY[i], type: sortedTypes[i]};
  }
  let graph: Graph = {
    TNodes,
    categories: [""]
  };
  const deepCopy = combinations.map(combination => [...combination]);
  let best = {distance: Infinity, path: [TNodes[0]] , possible: false};
  for (let i = 0; i < deepCopy.length; i++) {
    graph = {TNodes, categories: deepCopy[i]}
    graph.categories[graph.categories.length] = "START";  
    let result = findMinimumDistanceAnywhere(graph, 0); 
    if (result.distance < best.distance) {
      best.path = result.path; 
      best.distance = result.distance;
    }
  }
  if (best.distance == Infinity) {
    return {distance: Infinity, path: [], possible: false};
  }
  let distanceInKm = best.distance / 50;
  if (distanceInKm > budget * 2) {
    return {distance: best.distance, path: best.path, possible: false};
  } 
  return {distance: best.distance, path: best.path, possible: true};


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
): { distance: number; path: TNode[] } {
  const [sortedX, sortedY, sortedTypes] = sortPointsWithTypes(xData, yData, typesData, [currentX,currentY]);
  let TNodes:  TNode[] = [{id: 0, x: currentX, y: currentY, type: "START"}];
  for (let i = 1; i < 100; i++) {
    TNodes[i] = {id: i, x: sortedX[i], y:sortedY[i], type: sortedTypes[i]};
  }
  TNodes[100] = {id: 100, x: targetX, y:targetY, type: "END"}
  let graph: Graph = {
    TNodes,
    categories 
  };
  const result = findMinimumDistanceToTypesAndEnd(graph, 0, 100);
  return result;
}
const uniqueCombinations = getCombinations(cuisines);
// Example
console.log(savingFuel(["START", "END", "Pizza", "Coffee", "Chinese"], data.x, data.y, data.type, 0,0,0,0));
console.log("GO FRUGAL!");
console.log(goFrugal(app.data.x, app.data.y, app.data.type, 0,0, uniqueCombinations, 1));



