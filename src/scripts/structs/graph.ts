/**
 * Represents a node in a graph.
 * @template T - The type of the value stored in the node.
 */
interface vector {
  x: number;
  y: number;
}
class GraphNode<T> {
    value:vector; 
    neighbors: Map<GraphNode<T>, number>;

    /**
     * Creates an instance of GraphNode.
     * @param {T} x - The x value to be stored in the node.
     * @param {T} y - The y value to be stored in the node.
     */
    constructor(x: number, y: number) {
        this.value =  {x,y};
        this.neighbors = new Map();
    }

    /**
     * Adds a neighboring node with a specified weight.
     * @param {GraphNode<T>} node - The neighboring node to be added.
     * @param {number} weight - The weight of the edge connecting this node to the neighbor.
     * @example
     * const nodeA = new GraphNode('A');
     * const nodeB = new GraphNode('B');
     * nodeA.addNeighbor(nodeB, 5); // Adds nodeB as a neighbor of nodeA with a weight of 5.
     */
    addNeighbor(node: GraphNode<T>, weight: number): void {
        this.neighbors.set(node, weight);
    }

    /**
     * Retrieves the neighbors of this node.
     * @returns {Map<GraphNode<T>, number>} A map of neighboring nodes and their corresponding weights.
     * @example
     * const nodeA = new GraphNode('A');
     * const nodeB = new GraphNode('B');
     * const nodeC = new GraphNode('C');
     * nodeA.addNeighbor(nodeB, 5);
     * nodeA.addNeighbor(nodeC, 10);
     * const neighbors = nodeA.getNeighbors(); // Returns a Map with nodeB and nodeC as keys and their weights.
     */
    getNeighbors(): Map<GraphNode<T>, number> {
        return this.neighbors;
    }
}
