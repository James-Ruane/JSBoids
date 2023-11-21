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
            const x = Math.floor(Math.random() * this.bound.x);
            const y = Math.floor(Math.random() * this.bound.y);
            const z = Math.floor(this.random(this.spawnArea.z, this.bound.z));            
            const boid = new Boid(x,y,z);
            this.flock.pushToFlock(boid);
        }
    }

    addWindmill() {
        const x = 62.5;
        const y = 75;
        const z = 100;            
        const windmill = new Windmill(x,y,z);
        this.flock.pushToWindmills(windmill);
    }

}
