// js/node_manager.js

import { setSelectedNode } from "./controls_manager.js";
import { onResize } from "./helpers.js";
import { Node } from "./node.js";
import { AlphaBeta } from "./algorithms/alphabeta.js";
import { Minimax } from "./algorithms/minimax.js";
import { Negamax } from "./algorithms/negamax.js";
import { StatisticsManager } from "./statistics_manager.js";
import { AnimationController } from "./animation_controller.js";

export function NodeManager(canvasID) {
    this.canvas = document.getElementById(canvasID);
    this.ctx = this.canvas.getContext("2d");
    this.nodes = [];
    this.selected = null;
    this.bottomLayerCount = null;
    this.currentNode = null;
    
    // Add algorithm selection
    this.algorithmSelect = document.getElementById("algorithm-select");
    this.currentAlgorithm = null;
    
    // Add statistics manager
    this.statisticsManager = new StatisticsManager();
    
    // Add animation controller
    this.animationController = new AnimationController(this);

    window.addEventListener("resize", this.draw.bind(this));
    canvas.addEventListener("mousedown", this.onMouseClick.bind(this));
    
    document.getElementById("run").addEventListener("click", this.run.bind(this));
    document.getElementById("step").addEventListener("click", this.step.bind(this));
    document.getElementById("reset").addEventListener("click", this.reset.bind(this));

    document.getElementById("addChild").addEventListener("click", this.addChild.bind(this));
    document.getElementById("deleteNode").addEventListener("click", this.deleteNode.bind(this));
    document.getElementById("setValue").addEventListener("click", this.setValue.bind(this));
    
    // Add event listener for algorithm selection
    if (this.algorithmSelect) {
        this.algorithmSelect.addEventListener("change", this.algorithmChanged.bind(this));
    }
}

/**
 * Handle algorithm selection change
 */
NodeManager.prototype.algorithmChanged = function() {
    // Reset visualization when algorithm changes
    this.reset();
};

/**
 * Initialize the selected algorithm
 */
NodeManager.prototype.initializeAlgorithm = function() {
    if (this.selected !== -1) {
        this.selected = -1;
        setSelectedNode(this.selected, this.selected == this.nodes[0][0]);
    }
    
    // Create the appropriate algorithm instance
    const algorithmType = this.algorithmSelect ? this.algorithmSelect.value : "alphabeta";
    
    switch(algorithmType) {
        case "minimax":
            this.currentAlgorithm = new Minimax(this.nodes[0][0]);
            break;
        case "negamax":
            this.currentAlgorithm = new Negamax(this.nodes[0][0]);
            break;
        case "alphabeta":
        default:
            this.currentAlgorithm = new AlphaBeta(this.nodes[0][0]);
            break;
    }
    
    // Initialize the algorithm
    this.currentAlgorithm.initialize();
    this.currentNode = this.currentAlgorithm.currentNode;
    
    // Reset statistics
    this.statisticsManager.reset();
    
    return this.currentAlgorithm;
};

NodeManager.prototype.reset = function() {
    if (this.selected !== -1 && this.currentNode !== null) {
        return;
    }
    
    // Stop any animation in progress
    if (this.animationController) {
        this.animationController.reset();
    }
    
    this.selected = null;
    this.currentNode = null;
    this.currentAlgorithm = null;
    
    // Reset all nodes in the tree
    for (const nodeLayer of this.nodes) {
        for (const node of nodeLayer) {
            node.pruned = false;
            node.step = 0;
            node.alpha = null;
            node.beta = null;
            node.color = null;
            node.originalValue = null;
            if (node.children.length != 0) {
                node.value = null;
            }
        }
    }
    
    // Reset statistics
    if (this.statisticsManager) {
        this.statisticsManager.reset();
    }
    
    setSelectedNode(this.selected, this.selected == this.nodes[0][0]);
    this.draw();
};

// In js/node_manager.js, update the step method:

NodeManager.prototype.step = function() {
    let isDone = false;
    
    // Initialize algorithm if not already started
    if (this.currentAlgorithm === null) {
        this.initializeAlgorithm();
    }
    
    // Perform one step
    if (this.currentAlgorithm !== null) {
        this.currentNode = this.currentAlgorithm.step();
        
        // Check if algorithm is complete
        if (this.currentNode === null) {
            isDone = true;
            // Update statistics after completion
            this.statisticsManager.update(this.currentAlgorithm.getStatistics());
        }
    }
    
    this.draw();
    return isDone;
};

NodeManager.prototype.run = function() {
    // Initialize algorithm if not already started
    if (this.currentAlgorithm === null) {
        this.initializeAlgorithm();
    }
    
    // Run algorithm to completion
    if (this.currentAlgorithm !== null) {
        this.currentAlgorithm.run();
        this.currentNode = null;
        
        // Update statistics after completion
        this.statisticsManager.update(this.currentAlgorithm.getStatistics());
    }
    
    this.draw();
};

// Rest of the NodeManager methods remain the same
// ...

NodeManager.prototype.setValue = function() {
    var value = document.getElementById("staticValue").value;
    if(isNaN(value) || value == "") {
        value = 0;
    } else {
        value = Number.parseInt(value);
        value = Math.min(99, Math.max(-99, value));
    }
    this.selected.value = value;
    document.getElementById("staticValue").value = value;
    this.draw();
}

NodeManager.prototype.addChild = function() {
    if (this.selected == null) {
        return;
    };
    this.selected.value = null;
    var newNode = new Node();
    newNode.layer = this.selected.layer + 1;
    newNode.max = !this.selected.max;
    newNode.parent = this.selected;
    this.selected.children.push(newNode);
    if (newNode.layer == this.nodes.length) {
        this.nodes.push([]);
    };
    this.nodes[newNode.layer].push(newNode);
    this.bottomLayerCount = null;
    setSelectedNode(this.selected, this.selected == this.nodes[0][0]);
    this.draw();
};

NodeManager.prototype.deleteNode = function() {
    if (this.selected == null || this.selected.layer == 0) {
        return;
    };
    var nodeStack = [this.selected];
    while (nodeStack.length != 0) {
        var node = nodeStack.pop();
        for (var i = 0; i < this.nodes[node.layer].length; i++) {
            if (this.nodes[node.layer][i] == node) {
                this.nodes[node.layer].splice(i, 1);
                break;
            };
        };
        for (const child of node.children.slice().reverse()) {
            nodeStack.push(child);
        };
    };
    for (var i = this.nodes.length - 1; i >= 0; i--) {
        if (this.nodes[i].length == 0) {
            this.nodes.splice(i, 1);
        };
    };
    var done = false;
    for (const node of this.nodes[this.selected.layer - 1]) {
        for (var i = 0; i < node.children.length; i++) {
            if (node.children[i] == this.selected) {
                node.children.splice(i, 1);
                if (node.children.length == 0) {
                    node.value = 0;
                };
                done = true;
                break;
            };
        };
        if (done) {
            break;
        };
    };
    this.selected = null;
    setSelectedNode(this.selected, this.selected == this.nodes[0][0]);
    this.bottomLayerCount = null;
    this.draw();
};

NodeManager.prototype.onMouseClick = function(event) {
    if (this.selected == -1) {
        return;
    };
    this.selected = null;
    for (const nodeLayer of this.nodes) {
        for (const node of nodeLayer) {
            var dist = Math.sqrt(Math.pow(event.offsetX - node.pos[0], 2) + Math.pow(event.offsetY - node.pos[1], 2));
            if (dist <= Node.radius) {
                this.selected = node;
                break;
            };
        };
        if (this.selected != null) {
            break;
        };
    };
    setSelectedNode(this.selected, this.selected == this.nodes[0][0]);
    this.draw();
};

NodeManager.prototype.setNodeRadius = function() {
    if (this.bottomLayerCount == null) {
        this.bottomLayerCount = 0;
        var nodeStack = [this.nodes[0][0]];
        while (nodeStack.length != 0) {
            var node = nodeStack.pop();
            if (node.children.length == 0) {
                this.bottomLayerCount += 1;
            } else {
                for (const child of node.children.slice().reverse()) {
                    nodeStack.push(child);
                };
            };
        };
    };
    var xDiam = this.canvas.width / (0.5 + 1.5 * this.bottomLayerCount);
    var yDiam = this.canvas.height / (1 + 2 * this.nodes.length);
    Node.radius = Math.min(xDiam, yDiam) / 2;
};

NodeManager.prototype.setNodePositions = function() {
    var xOffset = (this.canvas.width - Node.radius * (1 + 3 * this.bottomLayerCount)) / 2;
    var yOffset = (this.canvas.height - Node.radius * (1 + 4 * this.nodes.length)) / 2;
    var count = 2;
    var nodeStack = [this.nodes[0][0]];
    while (nodeStack.length != 0) {
        var node = nodeStack.pop();
        if (node.children.length == 0) {
            node.pos[0] = xOffset + count * Node.radius;
            node.pos[1] = yOffset + (2 + 4 * node.layer) * Node.radius;
            count += 3;
        } else {
            for (const child of node.children.slice().reverse()) {
                nodeStack.push(child);
            };
        };
    };
    for (const nodeLayer of this.nodes.slice(0, -1).reverse()) {
        for (const node of nodeLayer) {
            if (node.children.length != 0) {
                node.pos[0] = (node.children[0].pos[0] + node.children[node.children.length - 1].pos[0]) / 2;
                node.pos[1] = yOffset + (2 + 4 * node.layer) * Node.radius;
            };
        };
    };
};

NodeManager.prototype.draw = function() {
    onResize();
    this.setNodeRadius();
    this.setNodePositions();
    this.nodes[0][0].draw(this.ctx);
    
    var highlight = this.selected;
    if (this.currentNode != null) {
        highlight = this.currentNode;
    };
    if (highlight != null && highlight != -1) {
        this.ctx.lineWidth = Math.max(2, parseInt(Node.radius / 10));
        this.ctx.strokeStyle = "#f39c12"; // Bright orange highlight
        
        // Pulsing effect
        const currentTime = Date.now();
        const pulseScale = 1 + 0.1 * Math.sin(currentTime / 200);
        
        this.ctx.beginPath();
        this.ctx.arc(
            highlight.pos[0], 
            highlight.pos[1], 
            Node.radius * pulseScale, 
            0, 2 * Math.PI
        );
        this.ctx.stroke();
    };
};