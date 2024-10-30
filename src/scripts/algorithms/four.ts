function sortPointsWithTypes(
    xArray: number[],
    yArray: number[],
    typeArray: string[], // Add the type array
    inputPoint: [number, number]
): [number[], number[], string[]] {
    // Calculate distances from the input point to each point in the arrays
    const distances = xArray.map((x, index) => {
        const y = yArray[index];
        return Math.sqrt((x - inputPoint[0]) ** 2 + (y - inputPoint[1]) ** 2);
    });

    // Create an array of indices and sort them based on distances
    const sortedIndices = distances
        .map((distance, index) => ({ distance, index }))
        .sort((a, b) => a.distance - b.distance)
        .map(({ index }) => index);

    // Sort the x, y, and type arrays based on the sorted indices
    const sortedX = sortedIndices.map(index => xArray[index]);
    const sortedY = sortedIndices.map(index => yArray[index]);
    const sortedTypes = sortedIndices.map(index => typeArray[index]);

    return [sortedX, sortedY, sortedTypes];
}
const [sortedX, sortedY, sortedTypes] = sortPointsWithTypes(data.x, data.y, data.type, [86,83]);
// Example usage:
// const x: number[] = [1, 4, 5, 2];
// const y: number[] = [3, 6, 1, 7];
// const inputPoint: [number, number] = [3, 4];

// const [sortedX, sortedY] = sortPoints(x, y, inputPoint);
// console.log("Sorted X:", sortedX);
// console.log("Sorted Y:", sortedY);


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
  const dist: number[][] = Array.from({ length: n }, () => Array(n).fill(Infinity)); for (let i = 0; i < n; i++) {
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
function findMinimumDistance(graph: Graph, startId: number, endId: number): { distance: number; path: TNode[] } {
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
  dp[startId][0] = 0; // Start distance is zero, with no categories visited

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
    path.push(TNodes[currentTNode]);
    const prevTNode = previous[currentTNode][currentMask];
    currentMask &= ~categoryMap[TNodes[currentTNode].type]; // Remove the category from mask
    currentTNode = prevTNode;
  }

  // Reverse the path to get it from start to end
  path.reverse();

  return { distance: minDistance, path };
}

// Example usage
const x: TNode[] = [
  { id: 0, x: 0, y: 0, type: "X" },
  { id: 1, x: 1, y: 2, type: "B" },
  { id: 2, x: 3, y: 1, type: "D" },
  { id: 3, x: 4, y: 4, type: "B" },
  { id: 4, x: 5, y: 0, type: "A" },
  { id: 5, x: 1, y: 5, type: "C" },
];
let TNodes:  TNode[] = [];

for (let i = 0; i < 2000; i++) {
  TNodes.push({id: i, x: sortedX[i], y:sortedY[i], type: sortedTypes[i]});
}

console.log(TNodes);


let graph: Graph = {
  TNodes,
  categories: ["Pizza", "Burger", "Mexican", "Indian"],
};


let result = findMinimumDistance(graph, 0, 0);
console.log("Minimum distance:", result.distance);
console.log("Path taken:");
result.path.forEach(TNode => {
  console.log(`TNode ID: ${TNode.id}, Type: ${TNode.type}, Coordinates: (${TNode.x}, ${TNode.y})`);
});



