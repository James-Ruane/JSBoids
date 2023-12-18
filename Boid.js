export default class Boid{
    /**
     * Represents a boid  object.
     * @param {number} x - The boids x coordinate
     * @param {number} y - The boids y coordinate
     * @param {number} z - The boids z coordinate
     */
    constructor(x,y,z){// TODO create new species of boid that extends this class, main different will be vision, speed and FOV
        // Geometery and material for rendering
        this.geometry = new THREE.SphereGeometry( 1, 64, 32 );    
        this.material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );  
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.deadMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        this.deadMesh = new THREE.Mesh( this.geometry, this.deadMaterial );
       // The boids position, velocity and acceleration vectors
        this.position = new THREE.Vector3(x,y,z);
        this.velocity = new THREE.Vector3(this.random(-2,2), this.random(-2,2), this.random(-2,0)); // changed to zero so boids start moving in correct direction
        this.acceleration = new THREE.Vector3(this.random(-2, 2), this.random(-2,2), this.random(-2,0));
        // The boids state (Dead / Alive)      
        this.dead = false;        
        // Boids characteristics 
        this.vision = 20; // Vision range of the boid
        this.maxSpeed = 0.3; // Maximum speed the boid can achieve
        this.maxForce = 0.05; // Maximum steering force applied to the boid
        this.fov = -100; // FOV of the boid //TODO convert this to an angle would be nice
        
    }

    /**
     * Updates the boids position, velocity and acceleration ensuring it does not exceed maxSpeed
     */
    update(){
        this.position = this.position.add(this.velocity);
        this.velocity = this.velocity.add(this.acceleration);
        // Calculate the magnitude (length) of the velocity vector
        let n = Math.sqrt(this.velocity.x**2 + this.velocity.y**2 + this.velocity.z**2);
        // Limit the speed to the maximum speed if it exceeds the maximum speed
        let f = Math.min(n, this.maxSpeed) / n;
        this.velocity.set(f * this.velocity.x, f * this.velocity.y, f * this.velocity.z);
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
}

