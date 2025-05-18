export function Node() {
    this.pos = [0, 0];
    this.children = [];
    this.value = 0;
    this.pruned = false;
    this.step = 0;
};

Node.prototype.setPruned = function() {
    this.pruned = true;
    for (const child of this.children) {
        child.setPruned();
    };
};

// Modified so algorithm can be stepped through
Node.prototype.minimax = function() {
    if (this.step == 0) {
        this.childSearchDone = false
        this.currentChildSearch = 0;
        if (this.children.length == 0) {
            if (this.parent != null) {
                this.parent.return = this.value;
            };
            if (this.parent == null) {
                return this.parent;
            };
            return this.parent.minimax();
        };
        if (this.max) {
            this.value = Number.NEGATIVE_INFINITY;
        } else {
            this.value = Number.POSITIVE_INFINITY;
        };
        this.step += 1;
    };
    if (this.step == 1) {
        if (this.currentChildSearch == this.children.length) {
            if (this.parent != null) {
                this.parent.return = this.value;
            };
            if (this.parent == null) {
                return this.parent;
            };
            return this.parent.minimax();;
        };
        if (this.childSearchDone) {
            for (var i = this.currentChildSearch; i < this.children.length; i++) {
                this.children[i].setPruned();
            };
            this.currentChildSearch = this.children.length;
            return this;
        };
        var child = this.children[this.currentChildSearch];
        child.alpha = this.alpha;
        child.beta = this.beta;
        this.step += 1;
        return child;
    } else if (this.step == 2) {
        var childValue = this.return
        if (this.max) {
            this.value = Math.max(this.value, childValue);
            this.alpha = Math.max(this.alpha, childValue);
        } else {
            this.value = Math.min(this.value, childValue);
            this.beta = Math.min(this.beta, childValue);
        };
        if (this.beta <= this.alpha) {
            this.childSearchDone = true;
        };
        this.currentChildSearch += 1;
        this.step -= 1;
        return this;
    };
};

// Add to js/node.js - Update the draw method

Node.prototype.draw = function(ctx) {
    // Draw connections first with gradient lines
    for (const node of this.children) {
        const gradient = ctx.createLinearGradient(
            this.pos[0], this.pos[1],
            node.pos[0], node.pos[1]
        );
        
        gradient.addColorStop(0, this.max ? "#3498db" : "#e74c3c");
        gradient.addColorStop(1, node.max ? "#3498db" : "#e74c3c");
        
        ctx.lineWidth = Math.max(2, parseInt(Node.radius / 20));
        
        if (node.pruned) {
            ctx.strokeStyle = "#95a5a6"; // Gray for pruned branches
        } else {
            ctx.strokeStyle = gradient;
        }
        
        ctx.beginPath();
        ctx.moveTo(this.pos[0], this.pos[1] + Node.radius - 1);
        ctx.lineTo(node.pos[0], node.pos[1] - Node.radius + 1);
        ctx.stroke();
        
        node.draw(ctx);
    };
    
    // Draw nodes with gradients and shadows
    ctx.beginPath();
    ctx.arc(this.pos[0], this.pos[1], Node.radius, 0, 2 * Math.PI);
    
    // Add shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Create gradient for node fill
    const nodeGradient = ctx.createRadialGradient(
        this.pos[0] - Node.radius/3, this.pos[1] - Node.radius/3, 1,
        this.pos[0], this.pos[1], Node.radius
    );
    
    if (this.max) {
        // Blue gradient for MAX nodes
        nodeGradient.addColorStop(0, "#5dade2");
        nodeGradient.addColorStop(1, "#2980b9");
        ctx.fillStyle = nodeGradient;
        ctx.fill();
        ctx.shadowColor = 'transparent'; // Reset shadow for border
        ctx.lineWidth = Math.max(2, parseInt(Node.radius / 10));
        ctx.strokeStyle = this.pruned ? "#95a5a6" : "#1c638e";
        ctx.stroke();
        ctx.fillStyle = "#ffffff"; // White text
    } else {
        // Red gradient for MIN nodes
        nodeGradient.addColorStop(0, "#f1948a");
        nodeGradient.addColorStop(1, "#c0392b");
        ctx.fillStyle = nodeGradient;
        ctx.fill();
        ctx.shadowColor = 'transparent'; // Reset shadow for border
        ctx.lineWidth = Math.max(2, parseInt(Node.radius / 10));
        ctx.strokeStyle = this.pruned ? "#95a5a6" : "#922b21";
        ctx.stroke();
        ctx.fillStyle = "#ffffff"; // White text
    };
    
    // Draw the value
    ctx.font = "bold " + Node.radius/1.5 + "px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = 'transparent'; // No shadow for text
    
    if (this.value != null && this.value != Number.POSITIVE_INFINITY && this.value != Number.NEGATIVE_INFINITY) {
        ctx.fillText(this.value, this.pos[0], this.pos[1] + Node.radius / 15);
    };

    // Alpha-Beta values with better styling
    if (this.children.length != 0) {
        ctx.font = "bold " + Node.radius / 2.5 + "px Arial";
        
        // Alpha value
        var alphaText = "α: ";
        if (this.alpha == Number.POSITIVE_INFINITY) {
            alphaText += "∞";
        } else if (this.alpha == Number.NEGATIVE_INFINITY) {
            alphaText += "-∞";
        } else if (this.alpha == null){
            alphaText = "";
        } else {
            alphaText += this.alpha;
        }
        
        // Alpha box
        if (alphaText) {
            const metrics = ctx.measureText(alphaText);
            const padding = Node.radius / 5;
            const width = metrics.width + padding * 2;
            const height = Node.radius / 2;
            const x = this.pos[0] - width / 2;
            const y = this.pos[1] - Node.radius * 1.8;
            
            ctx.fillStyle = "rgba(41, 128, 185, 0.8)";
            ctx.beginPath();
            ctx.roundRect(x, y, width, height, 5);
            ctx.fill();
            
            ctx.fillStyle = "#ffffff";
            ctx.fillText(alphaText, this.pos[0], y + height/2);
        }
        
        // Beta value
        var betaText = "β: ";
        if (this.beta == Number.POSITIVE_INFINITY) {
            betaText += "∞";
        } else if (this.beta == Number.NEGATIVE_INFINITY) {
            betaText += "-∞";
        } else if (this.beta == null){
            betaText = "";
        } else {
            betaText += this.beta;
        }
        
        // Beta box
        if (betaText) {
            const metrics = ctx.measureText(betaText);
            const padding = Node.radius / 5;
            const width = metrics.width + padding * 2;
            const height = Node.radius / 2;
            const x = this.pos[0] - width / 2;
            const y = this.pos[1] - Node.radius * 1.3;
            
            ctx.fillStyle = "rgba(192, 57, 43, 0.8)";
            ctx.beginPath();
            ctx.roundRect(x, y, width, height, 5);
            ctx.fill();
            
            ctx.fillStyle = "#ffffff";
            ctx.fillText(betaText, this.pos[0], y + height/2);
        }
    }
};

Node.radius = 0