import Boid from './Boid.js';
import Windmill from './windmill.js';

export default class flockHelper{
    /**
     * Represents the flockHelper class.
     * @param {Array} flock - The flock array containing boids of this species.
     * @param {Object} bound - The bound object containing the x,y,z dimensions of the simulation area
     */
    constructor(flock, bound){
        this.flock = flock;
        this.bound = bound;
        this.spawnArea = new THREE.Vector3(this.bound.x, this.bound.y, this.bound.z - 100); 
        this.group = new THREE.Group
    }

    /**
     * Generates a random number between a given min and max value
     * @param {number} max - The maximum value
     * @param {number} min - The minimum value
     * @returns {number} - random number between min and max
     */
    random(min, max){
        const difference = max - min
        const random = Math.round(difference * Math.random())
        return random + min
    }
    
    /**
     * Pushes a given number of boids to the flock
     * @param {number} count - The number of boids to add to the flock. (default = 2)
     */
    addBoids(count=2) {
        for(let i=0; i<count; i++) {
            const x = Math.ceil(Math.random() * this.bound.x) - 5;
            const y = Math.ceil(Math.random() * this.bound.y) - 5;
            const z = Math.ceil(this.random(this.spawnArea.z, this.bound.z)) - 5;            
            const boid = new Boid(x,y,z);
            this.flock.pushToFlock(boid);
        }
    }

    /**
     * Pushes a windmill to the windmill array
     */
    addWindmill() {  // TODO add more windmills add more blades
        const x = 62.5; // 125
        const y = 37.5; // 125
        const z = 300;     
        const d = 130;
        const h = 10;
        const w = 2;   
        
        const d2 = 130
        const h2 = 10
        const windmill = new Windmill(x,y,z, d, h, w, this.bound, 0, this);
        const windmill2 = new Windmill(x,y,z, d2, h2, w, this.bound, 1, this);
        const windmill3 = new Windmill(x,y,z, d2, h2, w, this.bound, 1, this);
        
        const group2 = new THREE.Group
        const group3 = new THREE.Group
        const group4 = new THREE.Group

        group2.add(windmill.mesh);
        group2.rotation.z = 2* Math.PI / 3
        this.group.add(group2)

        group3.add(windmill2.mesh);
        group3.rotation.z = 4 * Math.PI / 3
        this.group.add(group3)

        group4.add(windmill3.mesh);
        group4.rotation.z = 0
        this.group.add(group4)
        
        windmill.mesh.position.set(x,0,z);
        windmill2.mesh.position.set(x,0,z);
        windmill3.mesh.position.set(x,0,z);

        this.group.position.set(x, y, 0)

        this.flock.pushToWindmills(windmill);
        this.flock.pushToWindmills(windmill2);
        this.flock.pushToWindmills(windmill3);
    }

}
