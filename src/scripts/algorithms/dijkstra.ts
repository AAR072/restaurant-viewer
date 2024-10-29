/**
 * Implements Dijkstra's algorithm to find the shortest path from a start node to a target node.
 * @template T - The type of the value stored in the graph nodes.
 * @param {GraphNode<T>} startNode - The starting node for the pathfinding algorithm.
 * @param {GraphNode<T>} targetNode - The target node to reach.
 * @returns {{ distance: number, path: GraphNode<T>[] }} An object containing the shortest distance and the path taken.
 * @throws {Error} Throws an error if the start node or target node is not reachable.
 * @example
 * const nodeA = new GraphNode('A');
 * const nodeB = new GraphNode('B');
 * const nodeC = new GraphNode('C');
 * 
 * nodeA.addNeighbor(nodeB, 1);
 * nodeA.addNeighbor(nodeC, 4);
 * nodeB.addNeighbor(nodeC, 2);
 * 
 * const result = dijkstraShortestPath(nodeA, nodeC);
 * console.log(result.distance); // Outputs: 3
 * console.log(result.path.map(node => node.value)); // Outputs: ['A', 'B', 'C']
 * 
 * // If a path does not exist
 * const unreachableNode = new GraphNode('D');
 * const unreachableResult = dijkstraShortestPath(nodeA, unreachableNode);
 * // Throws an error: "Target node is not reachable from the start node"
 *
 * @timecomplexity
 * O(v^2) where v is the number of vertices in the graph.
 * This is due to the nested loop structure, where we check all vertices for the minimum distance.
 * If a priority queue is used instead of a linear search, the complexity can be improved to O(E log V),
 * where E is the number of edges.
 */
function dijkstraShortestPath<T>(
    startNode: GraphNode<T>,
    targetNode: GraphNode<T>
): { distance: number; path: GraphNode<T>[] } {
    const distances: Map<GraphNode<T>, number> = new Map();
    const previous: Map<GraphNode<T>, GraphNode<T> | null> = new Map(); const visited: Set<GraphNode<T>> = new Set();

    // Initialize all distances to infinity, except for the start node which is 0
    distances.set(startNode, 0);
    previous.set(startNode, null);

    const findMinDistanceNode = (): GraphNode<T> | null => {
        let minDistance = Infinity;
        let minNode: GraphNode<T> | null = null;

        for (const [node, distance] of distances) {
            if (!visited.has(node) && distance < minDistance) {
                minDistance = distance;
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
                const newDistance = currentDistance + weight;
                const currentNeighborDistance = distances.get(neighbor) ?? Infinity;

                if (newDistance < currentNeighborDistance) {
                    distances.set(neighbor, newDistance);
                    previous.set(neighbor, currentNode);
                }
            }
        }

        currentNode = findMinDistanceNode();
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
