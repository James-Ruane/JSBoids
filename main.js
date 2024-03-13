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
        this.numBoids = 1; 
        this.bound = new THREE.Vector3(125, 75, 675);  //250, 250
        this.headless = false;
        this.iterations = 0;
        this.speciesIterations = 0;
        this.runNo = 0;
        this.frames = 0;
        this.setup = true;
    }

    /**
     * Initializes the simulation by setting up the flock, renderer, helper, and starts rendering.
     */
    init() {
        // Create a new flock object with provided boundaries
        this.flock = new Flock(this.bound, this.headless);

        this.flockHelper = new flockHelper(this.flock, this.bound);
        this.flockHelper.addBoids(this.numBoids); // Add boids to the flock
        this.flockHelper.addWindmill(); // Add windmill to the simulation


        // Initialize a SimpleRenderer with boundaries and the flock
        if (!this.headless){
            this.simpleRenderer = new SimpleRenderer(this.bound, this.flock, this.flockHelper);
            this.simpleRenderer.init(); 
        }
        // Create a flockHelper object with the flock and boundaries
        // Start rendering the simulation by calling the 'render' method using requestAnimationFrame
        window.requestAnimationFrame(this.render.bind(this), 1000/30);
    }

    /**
     * Initiates the rendering loop for the simulation and gathers data for analysis and resets simulation
     */
    render() {
        const boid = this.flock.flock[0];   
        if (this.iterations == 50) {
            const blob = new Blob([this.flock.content], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = (Math.round((360 * (boid.fov + (Math.PI / 2))) / Math.PI).toString()) + ','+ boid.maxSpeed.toString() + ',' + boid.vision.toString() +'.txt';
            this.runNo++;
            link.click();
            this.iterations = 0;
            this.flock.content = "";
        }
        // Initiates the rendering loop by calling 'render' method using requestAnimationFrame
        window.requestAnimationFrame(this.render.bind(this), 1000/30); // Call at 30 FPS
        this.frames++;
        if (this.setup){
            const boid = this.flock.flock[0];
            console.log("config for run");
            this.flock.content += "\n@"
            console.log("FOV: ", Math.round((360 * (boid.fov + (Math.PI / 2))) / Math.PI));
            this.flock.content += "\nFOV: " + (Math.round((360 * (boid.fov + (Math.PI / 2))) / Math.PI).toString());
            console.log("Max Speed: ", boid.maxSpeed);
            this.flock.content += ("\nMax Speed: " + boid.maxSpeed.toString());
            console.log("Max Vision: ", boid.vision);
            this.flock.content += ("\nMax Vision: " + boid.vision.toString());
            this.setup = false;
        }
        if ((this.flock.collisionNum + this.flock.passedMillNum < this.numBoids * 0.9) && (this.frames < 2400)){ 
            this.flock.iterate(); // Update flock behavior and state
            if (!this.headless) {
                this.simpleRenderer.render(); // Render the updated state of the simulation 
            }
        }else{
            if (this.frames >= 4800){this.flock.content += "=====TIMED_OUT====="; console.log("timeout")}
            this.flock.reset() // Reset flock behavior and state
            this.frames = 0;
            this.speciesIterations++;
            this.setup = true;
            if (this.speciesIterations == 1){
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
