// js/algorithms/minimax.js

import { AlgorithmInterface } from "./algorithm_interface.js";

/**
 * Implementation of pure Minimax algorithm without pruning
 */
export class Minimax extends AlgorithmInterface {
    constructor(rootNode) {
        super(rootNode);
    }

    initialize() {
        super.initialize();
        
        // Reset all nodes in the tree
        this.resetAllNodes(this.rootNode);
    }

    resetAllNodes(node) {
        node.pruned = false;
        
        // Only reset calculated values, not static evaluations
        if (node.children.length > 0) {
            node.value = null;
        }
        
        // Reset all children recursively
        for (const child of node.children) {
            this.resetAllNodes(child);
        }
    }

    step() {
        // If no current node, algorithm is complete
        if (this.currentNode === null) {
            return null;
        }

        // Process current node based on its step
        if (this.currentNode.step === undefined) {
            this.currentNode.step = 0;
        }

        this.trackNodeVisit(this.currentNode);

        // First step: Initialize node
        if (this.currentNode.step === 0) {
            return this.initializeNode();
        }
        // Second step: Process child results
        else if (this.currentNode.step === 1) {
            return this.processChildResults();
        }
        // Third step: Update node value from child result
        else if (this.currentNode.step === 2) {
            return this.updateNodeValue();
        }
    }

    initializeNode() {
        const node = this.currentNode;
        node.currentChildSearch = 0;

        // If leaf node, return its value
        if (node.children.length === 0) {
            if (node.parent !== null) {
                node.parent.return = node.value;
            }
            this.currentNode = node.parent;
            return this.currentNode;
        }

        // Initialize value based on node type
        if (node.max) {
            node.value = Number.NEGATIVE_INFINITY;
        } else {
            node.value = Number.POSITIVE_INFINITY;
        }

        node.step = 1;
        return node;
    }

    processChildResults() {
        const node = this.currentNode;

        // If all children have been searched
        if (node.currentChildSearch === node.children.length) {
            // Return result to parent
            if (node.parent !== null) {
                node.parent.return = node.value;
            }
            this.currentNode = node.parent;
            return this.currentNode;
        }

        // Process next child
        const child = node.children[node.currentChildSearch];
        node.step = 2;
        this.currentNode = child;
        return child;
    }

    // Called when we return from a child node
    updateNodeValue() {
        const node = this.currentNode;
        const childValue = node.return;

        // Update node value based on node type
        if (node.max) {
            node.value = Math.max(node.value, childValue);
        } else {
            node.value = Math.min(node.value, childValue);
        }

        node.currentChildSearch += 1;
        node.step = 1;
        return node;
    }
}