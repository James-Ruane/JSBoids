export default class Boid{
    /**
     * Represents a boid  object.
     * @param {number} x - The boids x coordinate
     * @param {number} y - The boids y coordinate
     * @param {number} z - The boids z coordinate
     */
    constructor(x,y,z){
        // Geometery and material for rendering
        this.geometry = new THREE.SphereGeometry( 1, 64, 32 );    
        this.material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );  
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.deadMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        this.deadMesh = new THREE.Mesh( this.geometry, this.deadMaterial );
       // The boids position, velocity and acceleration vectors
        this.position = new THREE.Vector3(x,y,z);
        this.velocity = new THREE.Vector3(this.random(-2,2), this.random(-2,2), this.random(0,2)); // changed to zero so boids start moving in correct direction
        this.acceleration = new THREE.Vector3(this.random(-2, 2), this.random(-2,2), this.random(0,2));
        // The boids state (Dead / Alive)      
        this.dead = false;        
        // Boids characteristics 
        this.visions = [150, 50, 100, 150]; //5, 50, 100, 150
        this.vision = this.visions[0]; // Vision range of the boid
        
        this.maxSpeeds = [0.4, 0.4, 0.6]; // 0.2, 0.4, 0.6
        this.maxSpeed = this.maxSpeeds[0]; // Maximum speed the boid can achieve

        this.fovs = [0, -(Math.PI / 4), -(5 * Math.PI / 12),  , 0, (Math.PI / 4), (5 * Math.PI / 12)];// 30, 90 , 180, 360

                    // +- (5 * Math.PI / 12)- 30 / 330
                    // +- (Math.PI / 3)     - 60 / 300
                    // +- (Math.PI / 4)     - 90 / 270
                    // +- -(Math.PI / 6)    - 120 / 240
                    // +- (Math.PI / 12)    - 150 / 210
                    

        this.fov = this.fovs[0]; // FOV of the boid in radians between -pi/2 and pi/2

        this.fluctuation = new THREE.Vector3(0,0,0);
        
    }

    /**
     * Updates the boids position, velocity and acceleration ensuring it does not exceed maxSpeed
     */
    update(){ //TODO: add another parameter so that FOV can be big in one plane but small in another - replace one of the b's
        this.position = this.position.add(this.velocity);
        this.velocity = this.velocity.add(this.acceleration);
        // Calculate the magnitude (length) of the velocity vector
        let n = Math.sqrt(this.velocity.x**2 + this.velocity.y**2 + this.velocity.z**2);
        // Limit the speed to the maximum speed if it exceeds the maximum speed
        let f = Math.min(n, this.maxSpeed) / n;
        this.velocity.set(f * this.velocity.x, f * this.velocity.y, f * this.velocity.z);
    }

    /**
    * Checks if a given point is within the field of view (FOV) of the boid.
    * @param {number} x - The x-coordinate of the point.
    * @param {number} y - The y-coordinate of the point.
    * @param {number} z - The z-coordinate of the point.
    * @returns {boolean} - Indicates whether the point is within the FOV.
    */  
    inFOV(x, y, z){
        const b = this.fov;
        const bx = this.position.x;
        const by = this.position.y;
        const bz = this.position.z;
        x -= bx;
        y -= by;
        z -= bz;

        if(((x)**2 + (y)**2 + ((z)**2)) < this.vision**2){
            if (b > 0){
                if (!((y > -(z / Math.tan(b))) && (y < (z / Math.tan(b))) && (x > -(z / Math.tan(b))) && (x < (z / Math.tan(b))))){
                    return true;
                }
            } else if (b < 0){
                if ((y > -(z / Math.tan(b))) && (y < (z / Math.tan(b))) && (x > -(z / Math.tan(b))) && (x < (z / Math.tan(b)))){
                    return true;
                }
            } else if (b == 0){
                if (z < 0){
                    return true;
                }
            }
        }
        return false;
    }

    /**
    * Checks if a given point is within the field of view (FOV) of the boid and the windmills current area.
    * @param {Object} mill - The windmill object.
    * @param {Array} point - The points coordinates [x, y, z] to be checked.
    * @returns {boolean} - Indicates whether the point is within the FOV and inside the windmills current area
    */  
    windmillPointInFOV(mill, point){
        const x = point[0];
        const y = point[1];
        const z = point[2]; 
        if (mill.pointInWindmill(x, y, z)) {
            if(this.inFOV(x, y, z)){
                return true;     
            }
        }
        return false;
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
     * @param {number} fovCounter - tracks which fov is being used currently
     * updates fov 
     */
    updateFOV(fovCounter){
        this.fov = this.fovs[fovCounter];  
    }

    /**
     * @param {number} maSpeedCounter - tracks which maxSpeed is being used currently
     * updates maxSpeed 
     */
    updateMaxSpeed(maxSpeedCounter){
        this.maxSpeed = this.maxSpeeds[maxSpeedCounter];
    }

    /**
     * @param {number} visionCounter - tracks which vision range is being used currently
     * updates vision
     */
    updateVisionRange(visionCounter){
        this.vision = this.visions[visionCounter];
    }

    /**
     * @param {object} bound - The bound object containing x, y, z dimensions of the simulation area.
     * resets boids position, velocity and acceleration
     */
    resetPositions(bound){
        const spawn = new THREE.Vector3(bound.x, bound.y, bound.z - 100);
        const x = Math.ceil(Math.random() * bound.x) - 5;
        const y = Math.ceil(Math.random() * bound.y) - 5;
        const z = Math.ceil(this.random(spawn.z, bound.z)) - 5;            
        this.position.set(x,y,z);
        this.velocity.set(this.random(-2,2), this.random(-2,2), this.random(-2,0));
        this.acceleration.set(this.random(-2, 2), this.random(-2,2), this.random(-2,0));
    }
}
