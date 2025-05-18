// js/algorithms/algorithm_interface.js

/**
 * Base class for tree search algorithms
 * All algorithm implementations should extend this class
 */
export class AlgorithmInterface {
    /**
     * @param {Object} rootNode - The root node of the tree
     */
    constructor(rootNode) {
        this.rootNode = rootNode;
        this.currentNode = null;
        this.statistics = {
            nodesVisited: 0,
            nodesPruned: 0,
            maxDepth: 0,
            startTime: 0,
            endTime: 0
        };
    }

    /**
     * Initialize the algorithm
     * Called before starting the algorithm execution
     */
    initialize() {
        // Reset statistics
        this.statistics.nodesVisited = 0;
        this.statistics.nodesPruned = 0;
        this.statistics.maxDepth = 0;
        this.statistics.startTime = performance.now();
        
        // Reset algorithm state
        this.currentNode = this.rootNode;
    }

    /**
     * Perform a single step of the algorithm
     * @returns {Object|null} The next node to process, or null if the algorithm is complete
     */
    step() {
        throw new Error("Method 'step()' must be implemented by subclasses");
    }

    /**
     * Run the algorithm to completion
     * @returns {number} The final evaluation value
     */
    run() {
        this.initialize();
        while (this.currentNode !== null) {
            this.currentNode = this.step();
        }
        this.statistics.endTime = performance.now();
        return this.rootNode.value;
    }

    /**
     * Track a node visit for statistics
     * @param {Object} node - The node being visited
     */
    trackNodeVisit(node) {
        this.statistics.nodesVisited++;
        this.statistics.maxDepth = Math.max(this.statistics.maxDepth, node.layer);
    }

    /**
     * Track pruned nodes for statistics
     * @param {number} count - Number of nodes pruned
     */
    trackPrunedNodes(count = 1) {
        this.statistics.nodesPruned += count;
    }

    /**
     * Get performance statistics
     * @returns {Object} Statistics about the algorithm execution
     */
    getStatistics() {
        const stats = { ...this.statistics };
        
        // Calculate derived statistics
        stats.executionTime = (stats.endTime - stats.startTime).toFixed(2);
        stats.pruningEfficiency = stats.nodesVisited ? 
            (stats.nodesPruned / stats.nodesVisited * 100).toFixed(1) : 0;
            
        return stats;
    }
}