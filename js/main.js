// js/main.js

import { helpNext } from "./help.js";
import { NodeManager } from "./node_manager.js";
import { Node } from "./node.js";

// Create the node manager
var node_manager = new NodeManager("canvas");

// Initialize the tree with a sample structure
var startNode = new Node();
startNode.layer = 0;
startNode.max = true;
startNode.parent = null;
node_manager.nodes.push([startNode]);

// Create initial tree structure
node_manager.selected = startNode;
for (var i = 0; i < 3; i++) {
    node_manager.addChild();
};

// Add some children with random values
for (const child of startNode.children) {
    node_manager.selected = child;
    for (var i = 0; i < 2; i++) {
        node_manager.addChild();
        node_manager.selected.children[i].value = Math.floor(Math.random() * (99 - -99 + 1) + -99);
    };
};

// Reset selection and draw the initial state
node_manager.selected = null;
node_manager.reset();
node_manager.draw();

// Show help on first load
helpNext();

// Set event handlers for window resize
window.addEventListener("resize", () => {
    node_manager.draw();
});

// Set default algorithm
if (document.getElementById("algorithm-select")) {
    document.getElementById("algorithm-select").value = "alphabeta";
}