import Boid from './Boid.js';

export default class flockHelper{
    constructor(flock, bound){
        this.flock = flock;
        this.bound = bound;
    }

    init(numBoids){
        for (var i=0; i<numBoids; i++){
            this.flock.push(new Boid());
        }
    }
    
    addBoids(count=2) {
        for(let i=0; i<count; i++) {
            const x = Math.floor(Math.random() * this.bound.x);
            const y = Math.floor(Math.random() * this.bound.y);
            const z = Math.floor(Math.random() * this.bound.z);            
            const boid = new Boid(x,y,z);
            this.flock.pushToFlock(boid);
        }
    }

}
