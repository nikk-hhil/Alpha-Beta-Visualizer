// js/algorithms/alphabeta.js

import { AlgorithmInterface } from "./algorithm_interface.js";

/**
 * Implementation of Minimax algorithm with Alpha-Beta pruning
 * Directly adapted from the original implementation
 */
export class AlphaBeta extends AlgorithmInterface {
    constructor(rootNode) {
        super(rootNode);
    }

    initialize() {
        super.initialize();
        
        // Initialize alpha-beta values for the root node ONLY
        // Other nodes will get their values passed down during algorithm execution
        this.rootNode.alpha = Number.NEGATIVE_INFINITY;
        this.rootNode.beta = Number.POSITIVE_INFINITY;
        
        // Reset all nodes in the tree
        this.resetAllNodes(this.rootNode);
    }

    resetAllNodes(node) {
        node.pruned = false;
        // Only set alpha/beta to null for non-root nodes
        if (node !== this.rootNode) {
            node.alpha = null;
            node.beta = null;
        }
        node.step = 0;
        node.childSearchDone = false;
        node.currentChildSearch = 0;
        node.return = undefined; // Clear any previous return values
        
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

        this.trackNodeVisit(this.currentNode);

        // Follow the original Node.prototype.minimax implementation
        const node = this.currentNode;
        
        if (node.step === 0) {
            // Step 0 initialization
            node.childSearchDone = false;
            node.currentChildSearch = 0;
            
            // If leaf node, return its value
            if (node.children.length === 0) {
                if (node.parent !== null) {
                    node.parent.return = node.value;
                }
                if (node.parent === null) {
                    this.currentNode = null;
                    return null;
                }
                this.currentNode = node.parent;
                return node.parent;
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
        
        if (node.step === 1) {
            // Step 1 process children
            if (node.currentChildSearch === node.children.length) {
                if (node.parent !== null) {
                    node.parent.return = node.value;
                }
                if (node.parent === null) {
                    this.currentNode = null;
                    return null;
                }
                this.currentNode = node.parent;
                return node.parent;
            }
            
            if (node.childSearchDone) {
                // Pruning occurs here
                const prunedCount = node.children.length - node.currentChildSearch;
                for (let i = node.currentChildSearch; i < node.children.length; i++) {
                    this.pruneSubtree(node.children[i]);
                }
                this.trackPrunedNodes(prunedCount);
                
                node.currentChildSearch = node.children.length;
                return node;
            }
            
            // Process next child
            const child = node.children[node.currentChildSearch];
            
            // IMPORTANT: Properly pass alpha-beta values to child
            // This is critical for correct pruning behavior
            child.alpha = node.alpha;
            child.beta = node.beta;
            
            node.step = 2;
            this.currentNode = child;
            return child;
        } 
        else if (node.step === 2) {
            // Step 2 update values
            const childValue = node.return;
            
            if (node.max) {
                node.value = Math.max(node.value, childValue);
                node.alpha = Math.max(node.alpha, childValue);
            } else {
                node.value = Math.min(node.value, childValue);
                node.beta = Math.min(node.beta, childValue);
            }
            
            // DEBUG: Log values to help diagnose pruning issues
            console.log(`Node ${node.max ? 'MAX' : 'MIN'} - alpha: ${node.alpha}, beta: ${node.beta}, value: ${node.value}`);
            
            // Check pruning condition
            if (node.beta <= node.alpha) {
                console.log(`Pruning at node ${node.max ? 'MAX' : 'MIN'} with alpha=${node.alpha}, beta=${node.beta}`);
                node.childSearchDone = true;
            }
            
            node.currentChildSearch += 1;
            node.step = 1;  // Go back to step 1
            return node;
        }
        
        // Should never reach here
        console.error("Alpha-Beta step reached unexpected state");
        return null;
    }

    // Helper method to recursively mark a subtree as pruned
    pruneSubtree(node) {
        node.pruned = true;
        for (const child of node.children) {
            this.pruneSubtree(child);
        }
    }
}