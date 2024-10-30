/**
 * Implements A* algorithm to find the shortest path from a start node to a target node.
 * @template T - The type of the value stored in the graph nodes.
 * @param {GraphNode<T>} startNode - The starting node for the pathfinding algorithm.
 * @param {GraphNode<T>} targetNode - The target node to reach.
 * @param {(nodeA: GraphNode<T>, nodeB: GraphNode<T>) => number} heuristic - A heuristic function estimating the distance between two nodes.
 * @returns {{ distance: number, path: GraphNode<T>[] }} An object containing the shortest distance and the path taken.
 * @throws {Error} Throws an error if the start node or target node is not reachable.
 */
function aStarShortestPath<T>(
  startNode: GraphNode<T>,
  targetNode: GraphNode<T>,
  heuristic: (nodeA: GraphNode<T>, nodeB: GraphNode<T>) => number
): { distance: number; path: GraphNode<T>[] } {
  const distances: Map<GraphNode<T>, number> = new Map();
  const fScore: Map<GraphNode<T>, number> = new Map();
  const previous: Map<GraphNode<T>, GraphNode<T> | null> = new Map();
  const visited: Set<GraphNode<T>> = new Set();

  // Initialize all distances and fScores to infinity, except for the start node
  distances.set(startNode, 0);
  fScore.set(startNode, heuristic(startNode, targetNode));
  previous.set(startNode, null);

  const findMinFScoreNode = (): GraphNode<T> | null => {
    let minFScore = Infinity;
    let minNode: GraphNode<T> | null = null;

    for (const [node, score] of fScore) {
      if (!visited.has(node) && score < minFScore) {
        minFScore = score;
        minNode = node;
      }
    }

    return minNode;
  };

  let currentNode: GraphNode<T> | null = startNode;

  while (currentNode !== null) {
    if (currentNode === targetNode) {
      break; // Stop if the target node is reached
    }

    visited.add(currentNode);
    const currentDistance = distances.get(currentNode) ?? Infinity;

    for (const [neighbor, weight] of currentNode.getNeighbors()) {
      if (!visited.has(neighbor)) {
        const tentativeGScore = currentDistance + weight;
        const neighborDistance = distances.get(neighbor) ?? Infinity;

        if (tentativeGScore < neighborDistance) {
          distances.set(neighbor, tentativeGScore);
          previous.set(neighbor, currentNode);
          fScore.set(neighbor, tentativeGScore + heuristic(neighbor, targetNode));
        }
      }
    }

    currentNode = findMinFScoreNode();
  }

  // Reconstruct the shortest path
  const path: GraphNode<T>[] = [];
  let pathNode: GraphNode<T> | null = targetNode;

  while (pathNode !== null) {
    path.unshift(pathNode);
    pathNode = previous.get(pathNode) || null;
  }

  return {
    distance: distances.get(targetNode) ?? Infinity,
    path: path
  };
}
function calculateDistance(node1: GraphNode<any>, node2: GraphNode<any>): number {
    const dx = node2.value.x - node1.value.x;
    const dy = node2.value.y - node1.value.y;
    return Math.sqrt(dx * dx + dy * dy);
}
function findCheapestRoute(startNode: GraphNode<any>, restaurantTypes: string[], budget: number) {
    const visited = new Set<GraphNode<any>>();
    const queue: { node: GraphNode<any>; cost: number; path: GraphNode<any>[] }[] = [];
    queue.push({ node: startNode, cost: 0, path: [] });

    while (queue.length > 0) {
        // Sort the queue by cost (lowest cost first)
        queue.sort((a, b) => a.cost - b.cost);
        const { node, cost, path } = queue.shift()!; // Remove the first element

        // Check if we've visited this node
        if (visited.has(node)) continue;
        visited.add(node);

        // Add the current node to the path
        const currentPath = [...path, node];

        // Check if we've visited 4 restaurants of the desired types
        const typesVisited = currentPath.map(n => n.value.type);
        const matches = restaurantTypes.filter(type => typesVisited.includes(type));
        
        if (matches.length >= 4) {
            console.log(`Found path:`, currentPath.map(n => n.value.type), `with cost: $${cost.toFixed(2)}`); // Debug output
            if (cost <= budget) {
                return { cost, path: currentPath }; // Return the path if successful
            }
        }

        // Explore neighbors
        for (const [neighbor, weight] of node.getNeighbors()) {
            const travelCost = weight * 0.5; // Cost in dollars
            const newCost = cost + travelCost;

            if (newCost <= budget) {
                queue.push({ node: neighbor, cost: newCost, path: currentPath });
            }
        }
    }

    return null; // No valid path found within budget
}

// // Example usage with more nodes
// const nodeA = new GraphNode(0, 0, 'Italian');
// const nodeB = new GraphNode(1, 2, 'Chinese');
// const nodeC = new GraphNode(4, 0, 'Mexican');
// const nodeD = new GraphNode(3, 3, 'Japanese');
// const nodeE = new GraphNode(5, 5, 'Italian');
// const nodeF = new GraphNode(6, 7, 'Chinese');
// const nodeG = new GraphNode(7, 1, 'Mexican');
// const nodeH = new GraphNode(2, 4, 'Japanese');
// const nodeI = new GraphNode(8, 8, 'Italian');
// const nodeJ = new GraphNode(9, 3, 'Chinese');

// // Define edges with weights (using Euclidean distance)
// nodeA.addNeighbor(nodeB, calculateDistance(nodeA, nodeB));
// nodeA.addNeighbor(nodeC, calculateDistance(nodeA, nodeC));
// nodeA.addNeighbor(nodeD, calculateDistance(nodeA, nodeD));
// nodeA.addNeighbor(nodeE, calculateDistance(nodeA, nodeE));
// nodeA.addNeighbor(nodeF, calculateDistance(nodeA, nodeF));

// nodeB.addNeighbor(nodeC, calculateDistance(nodeB, nodeC));
// nodeB.addNeighbor(nodeD, calculateDistance(nodeB, nodeD));
// nodeB.addNeighbor(nodeG, calculateDistance(nodeB, nodeG));

// nodeC.addNeighbor(nodeD, calculateDistance(nodeC, nodeD));
// nodeC.addNeighbor(nodeH, calculateDistance(nodeC, nodeH));

// nodeD.addNeighbor(nodeE, calculateDistance(nodeD, nodeE));
// nodeD.addNeighbor(nodeI, calculateDistance(nodeD, nodeI));

// nodeE.addNeighbor(nodeF, calculateDistance(nodeE, nodeF));
// nodeE.addNeighbor(nodeJ, calculateDistance(nodeE, nodeJ));

// // Set up a graph with the starting node and desired restaurant types
// const startNode = nodeA;
// const restaurantTypes = ['Italian', 'Chinese', 'Mexican', 'Japanese'];
// const budget = 20; // Example budget

// const result = findCheapestRoute(startNode, restaurantTypes, budget);
// console.log(result);
// let index = app.sorted.distOrder[i];
// let x = app.data.x[index];
// let y = app.data.y[index];
// app.sorted.distSorted;
// const nodes = [];
// for (let i = 0; i < 10000; i++) {
//   const x = Math.floor(Math.random() * 10000);
//   const y = Math.floor(Math.random() * 10000);
//   nodes.push(new GraphNode(x, y));
// }

// // Connect each node to 3 random neighbors
// for (const node of nodes) {
//   const possibleNeighbors = nodes.filter(n => n !== node);
//   while (node.neighbors.size < 3 && possibleNeighbors.length > 0) {
//     const randomNeighbor = possibleNeighbors[Math.floor(Math.random() * possibleNeighbors.length)];
//     const weight = getDistance(node.value.x, node.value.y, randomNeighbor.value.x, randomNeighbor.value.y);
//     node.addNeighbor(randomNeighbor, weight);
//   }
// }
// console.log(nodes);

// const heuristic = (nodeA: GraphNode<{ x: number, y: number }>, nodeB: GraphNode<{ x: number, y: number }>): number => {
//   return getDistance(nodeA.value.x, nodeA.value.y, nodeB.value.x, nodeB.value.y);
// };
// console.log("DATA LOADED");

// const ay = performance.now();
// let out = aStarShortestPath(nodes[0], nodes[nodes.length-1], heuristic)
// const by  = performance.now();
// console.log("DONE A STAR")
// console.log(out.path.map(node => node.value)); // Outputs: ['A', 'B', 'C']




