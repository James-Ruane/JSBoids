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
        this.numBoids = 300; 
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
     * Initiates the rendering loop for the simulation and gathers data for analysis and resets simulation
     */
    render() {  // TODO: Gather data for analysis
        // Initiates the rendering loop by calling 'render' method using requestAnimationFrame
        window.requestAnimationFrame(this.render.bind(this), 1000/30); // Call at 30 FPS
        if (this.flock.collisionNum + this.flock.passedMillNum < this.numBoids * 0.9){ //TODO: update this condition
            this.flock.iterate(); // Update flock behavior and state
            if (!this.headless) {
                this.simpleRenderer.render(); // Render the updated state of the simulation 
            }
        }else{
            this.flock.reset() // Reset flock behavior and state 
        }

        // TODO: some form of boid reset i.e. based off both number of collisions and number of boids making it to the end
        // If collision + boids who reached end > theshold -> output stats, update parameters and reurn  
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const app = new Application();
    app.init();
});
