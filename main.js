import SimpleRenderer from './Render.js'
import Flock from './flock.js';
import flockHelper from './flockHelper.js';


class Application {
    /**
     * Represents the main application
     */
    constructor() {
        this.simpleRenderer = undefined;
        this.boids = undefined;
        this.flock = undefined;
        this.numBoids = 400; 
        this.bound = new THREE.Vector3(125, 75, 375);  
        this.headless = false;
    }

    /**
     * Initializes the simulation by setting up the flock, renderer, helper, and starts rendering.
     */
    init() {
        // Create a new flock object with provided boundaries
        this.flock = new Flock(this.bound, this.headless);

        // Initialize a SimpleRenderer with boundaries and the flock
        if (!this.headless){
            this.simpleRenderer = new SimpleRenderer(this.bound, this.flock);
            this.simpleRenderer.init(); 
        }
        // Create a flockHelper object with the flock and boundaries
        this.flockHelper = new flockHelper(this.flock, this.bound);
        this.flockHelper.addBoids(this.numBoids); // Add boids to the flock
        this.flockHelper.addWindmill(); // Add windmill to the simulation

        // Start rendering the simulation by calling the 'render' method using requestAnimationFrame
        window.requestAnimationFrame(this.render.bind(this), 1000/30);
    }

    /**
     * Initiates the rendering loop for the simulation and gathers data for analysis.
     */
    render() {  // TODO: Gather data for analysis
        // Initiates the rendering loop by calling 'render' method using requestAnimationFrame
        window.requestAnimationFrame(this.render.bind(this), 1000/30); // Call at 30 FPS

        this.flock.iterate(); // Update flock behavior and state
  
        if (!this.headless) {
            this.simpleRenderer.render(); // Render the updated state of the simulation 
        }   
    }

}

document.addEventListener('DOMContentLoaded', (new Application()).init());