// js/statistics_manager.js

/**
 * Manages statistics for algorithm visualization
 */
export class StatisticsManager {
    constructor() {
        // Initialize DOM element references
        this.nodesVisitedElement = document.getElementById('stat-nodes-visited');
        this.nodesPrunedElement = document.getElementById('stat-nodes-pruned');
        this.efficiencyElement = document.getElementById('stat-efficiency');
        this.maxDepthElement = document.getElementById('stat-max-depth');
        
        this.reset();
    }

    /**
     * Reset all statistics
     */
    reset() {
        this.statistics = {
            nodesVisited: 0,
            nodesPruned: 0,
            maxDepth: 0,
            executionTime: 0,
            pruningEfficiency: 0
        };
        
        this.updateDisplay();
    }

    /**
     * Update statistics with values from the algorithm
     * @param {Object} algorithmStats - Statistics from algorithm execution
     */
    update(algorithmStats) {
        if (!algorithmStats) return;
        
        this.statistics.nodesVisited = algorithmStats.nodesVisited || 0;
        this.statistics.nodesPruned = algorithmStats.nodesPruned || 0;
        this.statistics.maxDepth = algorithmStats.maxDepth || 0;
        this.statistics.executionTime = algorithmStats.executionTime || 0;
        
        // Calculate pruning efficiency
        if (this.statistics.nodesVisited > 0) {
            this.statistics.pruningEfficiency = 
                (this.statistics.nodesPruned / this.statistics.nodesVisited * 100).toFixed(1);
        } else {
            this.statistics.pruningEfficiency = 0;
        }
        
        this.updateDisplay();
    }

    /**
     * Update the statistics display in the UI
     */
    updateDisplay() {
        if (this.nodesVisitedElement) {
            this.nodesVisitedElement.textContent = this.statistics.nodesVisited;
        }
        
        if (this.nodesPrunedElement) {
            this.nodesPrunedElement.textContent = this.statistics.nodesPruned;
        }
        
        if (this.efficiencyElement) {
            this.efficiencyElement.textContent = `${this.statistics.pruningEfficiency}%`;
        }
        
        if (this.maxDepthElement) {
            this.maxDepthElement.textContent = this.statistics.maxDepth;
        }
    }

    /**
     * Get current statistics
     * @returns {Object} Current statistics
     */
    getStatistics() {
        return { ...this.statistics };
    }
}