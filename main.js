import SimpleRenderer from './Render.js'
import Boid from './Boid.js';
import Flock from './flock.js';
import flockHelper from './flockHelper.js';


class Application {
    constructor() {
        this.simpleRenderer = undefined;
        this.boids = undefined;
        this.flock = undefined;
        this.numBoids = 100; //2500 before some frame issues
        this.bound = new THREE.Vector3(125, 75, 375);
        
    }

    init() {

        this.flock = new Flock(this.bound);

        this.simpleRenderer = new SimpleRenderer(this.bound, this.flock); 
        this.simpleRenderer.init();

        this.flockHelper = new flockHelper(this.flock, this.bound);
        this.flockHelper.addBoids(this.numBoids);

        window.requestAnimationFrame(this.render.bind(this), 1000/30);
    }

    render() {
        window.requestAnimationFrame(this.render.bind(this), 1000/30);
        this.flock.iterate();
        this.simpleRenderer.render();   
    }

}

document.addEventListener('DOMContentLoaded', (new Application()).init());