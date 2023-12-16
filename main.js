import SimpleRenderer from './Render.js'
import Flock from './flock.js';
import flockHelper from './flockHelper.js';


class Application {
    constructor() {
        this.simpleRenderer = undefined;
        this.boids = undefined;
        this.flock = undefined;
        this.numBoids = 100; 
        this.bound = new THREE.Vector3(125, 75, 375); 
        
    }

    init() {

        this.flock = new Flock(this.bound);

        this.simpleRenderer = new SimpleRenderer(this.bound, this.flock); 
        this.simpleRenderer.init();

        this.flockHelper = new flockHelper(this.flock, this.bound);
        this.flockHelper.addBoids(this.numBoids);
        this.flockHelper.addWindmill();

        window.requestAnimationFrame(this.render.bind(this), 1000/30);
    }

    render() {
        // TODO Outputs so I can gether data to use in results. I.e. number of collisions per species, more likely to get hit bu upward / downward moving windmill ect.
        window.requestAnimationFrame(this.render.bind(this), 1000/30);
        this.flock.iterate();
        this.simpleRenderer.render();   
    }

}

document.addEventListener('DOMContentLoaded', (new Application()).init());