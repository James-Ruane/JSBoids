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
        this.numBoids = 100; 
        this.bound = new THREE.Vector3(125, 75, 675);  
        this.headless = false;
        this.iterations = 0;
        this.speciesIterations = 0;
        this.runNo = 0;
        this.frames = 0;
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
        if (this.iterations == 12) {
            const blob = new Blob([this.flock.content], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = (this.runNo.toString()) +'.txt';
            this.runNo++;
            link.click();
            this.iterations = 0;
            this.flock.content = "";
        }
        // Initiates the rendering loop by calling 'render' method using requestAnimationFrame
        window.requestAnimationFrame(this.render.bind(this), 1000/30); // Call at 30 FPS
        this.frames++;
        if ((this.flock.collisionNum + this.flock.passedMillNum < this.numBoids * 0.9) && (this.frames < 2400)){ 
            this.flock.iterate(); // Update flock behavior and state
            if (!this.headless) {
                this.simpleRenderer.render(); // Render the updated state of the simulation 
            }
        }else{
            if (this.frames >= 2400){this.flock.content += "=====TIMED_OUT====="; console.log("timeout")}
            this.flock.reset() // Reset flock behavior and state
            this.frames = 0;
            this.speciesIterations++;
            if (this.speciesIterations == 12){
                this.flock.updateParameters(); // Update parameters
                this.speciesIterations = 0;
            }
            this.iterations++;
        }
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const app = new Application();
    app.init();
});
