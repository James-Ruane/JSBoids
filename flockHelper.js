import Boid from './Boid.js';
import Windmill from './windmill.js';

export default class flockHelper{
    constructor(flock, bound){
        this.flock = flock;
        this.bound = bound;
        this.spawnArea = new THREE.Vector3(this.bound.x, this.bound.y, this.bound.z - 100); 
    }

    init(numBoids){
        for (var i=0; i<numBoids; i++){
            this.flock.push(new Boid());
        }
    }

    random(min, max){
        const difference = max - min
        const random = Math.round(difference * Math.random())
        return random + min
    }
    
    addBoids(count=2) {
        for(let i=0; i<count; i++) {
            const x = Math.ceil(Math.random() * this.bound.x) - 5;
            const y = Math.ceil(Math.random() * this.bound.y) - 5;
            const z = Math.ceil(this.random(this.spawnArea.z, this.bound.z)) - 5;            
            const boid = new Boid(x,y,z);
            this.flock.pushToFlock(boid);
        }
    }

    // TODO add more windmills 
    // TODO add more blades to windmills
    addWindmill() {
        const x = 62.5;
        const y = 37.5;
        const z = 100;     
        const d = 125;
        const h = 10;
        const w = 2;       
        const windmill = new Windmill(x,y,z, d, h, w, this.bound);
        this.flock.pushToWindmills(windmill);
    }

}
