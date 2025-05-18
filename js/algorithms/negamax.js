// js/algorithms/negamax.js

import { AlgorithmInterface } from "./algorithm_interface.js";

/**
 * Implementation of Negamax algorithm (variant of Minimax using negation)
 */
export class Negamax extends AlgorithmInterface {
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
        node.color = node.max ? 1 : -1; // Store color for negamax
        
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

        // If leaf node, return its value (multiplied by node color)
        if (node.children.length === 0) {
            // Store original value for display
            node.originalValue = node.value;
            
            // For negamax, we return value * color
            const negamaxValue = node.value * node.color;
            
            if (node.parent !== null) {
                node.parent.return = negamaxValue;
            }
            this.currentNode = node.parent;
            return this.currentNode;
        }

        // Initialize value for negamax
        node.value = Number.NEGATIVE_INFINITY;
        node.step = 1;
        return node;
    }

    processChildResults() {
        const node = this.currentNode;

        // If all children have been searched
        if (node.currentChildSearch === node.children.length) {
            // For visualization, restore the actual value based on node type
            if (node.originalValue === undefined) {
                node.originalValue = node.value * node.color;
            }
            
            // Return negamax value to parent
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
        
        // Key negamax principle: value = max(-child_value)
        // This is equivalent to value = max(-(-(child_value * child.color) * node.color))
        // which simplifies to value = max(child_value * child.color * node.color)
        // Since child.color = -node.color, this further simplifies to value = max(-child_value)
        const childValue = -node.return;
        
        // Update value based on negamax principle
        node.value = Math.max(node.value, childValue);

        node.currentChildSearch += 1;
        node.step = 1;
        return node;
    }
}