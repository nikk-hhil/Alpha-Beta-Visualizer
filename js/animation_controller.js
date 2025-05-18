// js/animation_controller.js

/**
 * Manages animation of algorithm visualization
 */
export class AnimationController {
    /**
     * @param {Object} nodeManager - Reference to the NodeManager
     */
    constructor(nodeManager) {
        this.nodeManager = nodeManager;
        this.isPlaying = false;
        this.speed = 5; // Default speed (1-10)
        this.animationId = null;
        
        // DOM elements
        this.playPauseButton = document.getElementById('play-pause');
        this.speedSlider = document.getElementById('speed-slider');
        this.speedLabel = document.getElementById('speed-label');
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    /**
     * Initialize event listeners for animation controls
     */
    initEventListeners() {
        if (this.playPauseButton) {
            this.playPauseButton.addEventListener('click', () => {
                this.togglePlay();
            });
        }
        
        if (this.speedSlider) {
            this.speedSlider.addEventListener('input', () => {
                this.setSpeed(parseInt(this.speedSlider.value));
            });
        }
    }
    
    /**
     * Toggle between play and pause states
     */
    togglePlay() {
        this.isPlaying = !this.isPlaying;
        
        if (this.isPlaying) {
            this.play();
            if (this.playPauseButton) {
                this.playPauseButton.textContent = 'Pause';
            }
        } else {
            this.pause();
            if (this.playPauseButton) {
                this.playPauseButton.textContent = 'Play';
            }
        }
    }
    
    /**
     * Start animation playback
     */
    play() {
        // If algorithm hasn't started yet, initialize it
        if (this.nodeManager.currentNode === null && this.nodeManager.selected !== -1) {
            this.nodeManager.initializeAlgorithm();
        }
        
        // Calculate step interval based on speed (1-10)
        // Slower speeds (1) = longer intervals, faster speeds (10) = shorter intervals
        const stepTime = 1000 / Math.pow(2, this.speed / 2);
        
        this.animationId = setInterval(() => {
            // Perform one step of the algorithm
            const isDone = this.nodeManager.step();
            
            // Stop animation if algorithm completes
            if (isDone) {
                this.pause();
                if (this.playPauseButton) {
                    this.playPauseButton.textContent = 'Play';
                }
                this.isPlaying = false;
            }
        }, stepTime);
    }
    
    /**
     * Pause animation playback
     */
    pause() {
        if (this.animationId) {
            clearInterval(this.animationId);
            this.animationId = null;
        }
    }
    
    /**
     * Set animation speed
     * @param {number} value - Speed value (1-10)
     */
    setSpeed(value) {
        this.speed = value;
        
        if (this.speedLabel) {
            this.speedLabel.textContent = value;
        }
        
        // If currently playing, restart with new speed
        if (this.isPlaying) {
            this.pause();
            this.play();
        }
    }
    
    /**
     * Reset animation state
     */
    reset() {
        this.pause();
        this.isPlaying = false;
        
        if (this.playPauseButton) {
            this.playPauseButton.textContent = 'Play';
        }
    }
}