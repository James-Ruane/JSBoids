export default class Flock{

    /**
     * Represents a flock object.
     * @param {Object} bound - The bound object containing x, y, z dimensions of the simulation area.
     */
    constructor(bound, headless){
        this.bound = bound; // Boundaries object containing x, y, z dimensions
        this.flock = []; // Array to hold boid objects
        this.windmills = []; // Array to hold windmill objects
        this.allignWeight = 2; // Weight for alignment behavior
        this.cohesionWeight = 0.1; // Weight for cohesion behavior
        this.separationWeight = 0.2; // Weight for separation behavior
        this.avoidWeight = 1; // Weight for avoidance behavior
        this.endWeight = 0.0015; // Weight for end behavior
        this.endPoint = new THREE.Vector3(62.5, 37.5, 0); // End point for end behavior calculations
        
        this.headless = headless;
        this.collisionNum = 0;
        this.passedMillNum = 0;

        this.gridDictionary = {};
        this.gridSize = 5; // the larger this is the larger the grid boxes are i.e. more boids will be factored in 

        this.fovCounter = 0;
        this.maxSpeedCounter = 0;
        this.visionCounter = 0;

        this.collisionPos = [];
        this.polarisation = 0;
        this.polarTotal = 0;

    }

    /**
     * Adds a boid to the flock.
     * @param {Object} boid - The boid object to be added to the flock.
     */
    pushToFlock(boid){
        this.flock.push(boid);
    }

    /**
    * Retrieves the flock array.
    * @returns {Array} The flock array containing boid objects.
    */
    getFlock(){
        return this.flock;
    }

    /**
     * Adds a windmill to the windmills array.
     * @param {Object} mill - The boid object to be added to the windmill array.
     */

    pushToWindmills(mill){
        this.windmills.push(mill);
    }

    /**
    * Retrieves the windmill array.
    * @returns {Array} The windmill array containing windmill objects.
    */
    getWindmills(){
        return this.windmills;
    }

    /**
    * Iterates through the flock performing the enforcing checking boundary conditions, applying flocking rules,
    * moving the boids and checking for collisions. Also moves each of the windmills
    */
    iterate(){
        this.gridDictionary = this.createGridDictionary(this.flock);
        this.passedMillNum = 0;
        var total = 0; 
        var avgVelocity = new THREE.Vector3(0,0,0);
        for(var i=0;i<this.flock.length;i++){
            const boid = this.flock[i];
            if (!boid.dead) {
                this.periodicBoundary(boid);
                this.flocking(boid);
                if (!isNaN(boid.velocity.x) && !isNaN(boid.velocity.y) && !isNaN(boid.velocity.z)) {
                    avgVelocity.x += boid.velocity.x / boid.velocity.length();
                    avgVelocity.y += boid.velocity.y / boid.velocity.length();
                    avgVelocity.z += boid.velocity.z / boid.velocity.length();
                    total++;
                }
                boid.update();
                this.collision(boid);
                if (this.passedMill(boid)){this.passedMillNum++;};
            }

        }
        avgVelocity.divideScalar(total);
        if ((!isNaN(avgVelocity.x)) && (!isNaN(avgVelocity.x)) && (!isNaN(avgVelocity.x))){
            this.polarisation += avgVelocity.length();
            this.polarTotal++;
        }

        for (var i=0; i<this.windmills.length; i++){
            const windmill = this.windmills[i];
            windmill.update();
        }
    }

    /**
    * Calls each of the flocking rules and applys the weighted acceleration of each to the boid
    * @param {object} boid - The boid to apply the acceleration to
    */
    flocking(boid){
        let acceleration = new THREE.Vector3(0,0,0);
        let avgA = this.allign(boid);
        let avgC = this.cohes(boid);
        let avgS = this.sep(boid);
        let end = this.end(boid);
        let avoidance = this.avoidance(boid);

        if (avoidance.x != 0 || avoidance.y != 0 || avoidance.z != 0){
            acceleration = acceleration.add(avoidance.multiplyScalar(0.5));
            acceleration = acceleration.add(end.multiplyScalar(0.05));
        } else{            
            acceleration = acceleration.add(avgA.multiplyScalar(this.allignWeight));
            acceleration = acceleration.add(avgC.multiplyScalar(this.cohesionWeight));
            acceleration = acceleration.add(avgS.multiplyScalar(this.separationWeight));
            acceleration = acceleration.add(end.multiplyScalar(this.endWeight));
        }
        boid.acceleration = acceleration
    }

    /**
    * Applies the end rule to a boid, moving it towards a destination
    * @param {object} boid - The boid to apply the rule to
    * @returns {THREE.Vector3} an normalised vector representing the average direction to move towards
    */
    end(boid){
        let avgC = new THREE.Vector3(this.endPoint.x , this.endPoint.y, this.endPoint.z);
        avgC.set(avgC.x - boid.position.x, avgC.y - boid.position.y, avgC.z - boid.position.z);
        const allignMag = Math.sqrt(avgC.x**2 + avgC.y**2 + avgC.z**2);
        avgC.set(avgC.x / allignMag, avgC.y / allignMag, avgC.z / allignMag);
        return avgC;
    } 
   
    /**
    * Applies the allignment rule to a boid, steering it towards the average direction of local boids
    * @param {object} boid - The boid to apply the rule to
    * @returns {THREE.Vector3} an normalised vector representing the average direction to move towards
    */
    allign(boid){
        let avgA = new THREE.Vector3(0,0,0);
        let total = 0;
        const gridKey = this.generateGridKey(boid);
        const boidsNear = this.gridDictionary[gridKey] || []   
        boidsNear.forEach(i => {
            if (boid != i && 
                boid.position.distanceTo(i.position) < boid.vision && boid.inFOV(i.position.x, i.position.y, i.position.z) && !(boid.position == i.position)) {
                total ++;
                avgA.x += i.velocity.x;
                avgA.y += i.velocity.y;
                avgA.z += i.velocity.z;
            }
        });

        if (total > 0){
            avgA.set(avgA.x / total, avgA.y / total, avgA.z / total);
            const allignMag = Math.sqrt((avgA.x**2) + (avgA.y**2) + (avgA.z**2));
            avgA.set(avgA.x / allignMag, avgA.y / allignMag, avgA.z / allignMag);
        }
        return avgA;
    }

    /**
    * Applies the cohesion rule to a boid, steering it towards the average position of local boids
    * @param {object} boid - The boid to apply the rule to
    * @returns {THREE.Vector3} an normalised vector representing the average direction to move towards
    */
    cohes(boid){
        let avgC = new THREE.Vector3(0,0,0);
        let total = 0;
        const gridKey = this.generateGridKey(boid);
        const boidsNear = this.gridDictionary[gridKey] || []
        boidsNear.forEach(i => {
            if (boid != i && 
                boid.position.distanceTo(i.position) < boid.vision && boid.inFOV(i.position.x, i.position.y, i.position.z) && !(boid.position == i.position)){
                total ++;
                avgC.x += i.position.x;
                avgC.y += i.position.y;
                avgC.z += i.position.z;
            }
        });

        if (total > 0){
            avgC.set(avgC.x / total, avgC.y / total, avgC.z / total); 
            avgC.set(avgC.x - boid.position.x, avgC.y - boid.position.y, avgC.z - boid.position.z);
            const allignMag = Math.sqrt(avgC.x**2 + avgC.y**2 + avgC.z**2);
            avgC.set(avgC.x / allignMag, avgC.y / allignMag, avgC.z / allignMag);
        }
        return avgC;
    }

    /**
    * Applies the seperation rule to a boid, steering it away from position of local boids
    * @param {object} boid - The boid to apply the rule to
    * @returns {THREE.Vector3} an normalised vector representing the average direction to move towards
    */
    sep(boid){
        let avgS = new THREE.Vector3(0,0,0);
        const {gridKey, maxArr} = this.generateGridKey(boid);

        const boidsNear = this.gridDictionary[gridKey] || []
        boidsNear.forEach(i => {
            let dist = boid.position.distanceTo(i.position);
            if (dist <= 0){
                dist = 0.01;
            } 
            if (boid != i && dist < boid.vision && boid.inFOV(i.position.x, i.position.y, i.position.z)  && !(boid.position == i.position)) {
                
                let sx = boid.position.x - i.position.x;
                let sy = boid.position.y - i.position.y;
                let sz = boid.position.z - i.position.z;

                avgS.x += (sx / dist) / dist;
                avgS.y += (sy / dist) / dist;
                avgS.z += (sz / dist) / dist;
            }
        });
        return avgS;

    }
    
    /**
    * Applies the avoidance rule to a boid, steering it away the position of a windmill
    * @param {object} boid - The boid to apply the rule to
    * @returns {THREE.Vector3} an normalised vector representing the average direction to move towards
    */
    avoidance(boid){    // TODO maybe find the closest point to the boid, instead of first
        const avoid = new THREE.Vector3(0,0,0);
        let pointsInFOV = [];
        for(var i=0; i<this.windmills.length; i++){
            for (var j=0; j<this.windmills[i].points.length; j++){
                const point = this.windmills[i].points[j];
                if (boid.windmillPointInFOV(this.windmills[i], point)){
                    pointsInFOV.push(point);
                }
            }
        }
        if (pointsInFOV.length > 0){
            const distance =  Math.sqrt((boid.position.x - pointsInFOV[0][0])**2 + (boid.position.y - pointsInFOV[0][1])**2 + (boid.position.z - pointsInFOV[0][2])**2)
            const oy = boid.position.y - pointsInFOV[0][1];
            avoid.y += (oy/distance)/distance;
        }
        return avoid;
    }

    /**
    * Checks to see if a boid has collided with the windmill, if it has update the boids dead attribute
    * @param {object} boid - The boid to check for a collision
    */
    collision(boid){
        this.windmills.forEach(mill => {
            let mX = 0;
            let mY = 0;
            let mZ = 0;
            if (this.headless){
                mX = boid.position.x;
                mY = boid.position.y;
                mZ = boid.position.z;
            }else{
                mX = boid.mesh.position.x;
                mY = boid.mesh.position.y;
                mZ = boid.mesh.position.z;
            }
            if (mill.pointInWindmill(mX, mY, mZ)){
                boid.dead=true;
                this.collisionPos.push([mX, mY, mZ]);
                this.collisionNum++;
            }
        });
    }

    /**
    * Checks to see if a boid has passed the windmill
    * @param {object} boid - The boid to check for a collision
    * @returns {boolean} - indicates if the boid has passed the windmill
    */
    passedMill(boid){
        var passed = true;
        this.windmills.forEach(mill => {
            if (boid.position.z > mill.minZ){
                passed = false;
            }
        });
        return passed;
    }
    
    /**
     * Applies periodic boundary conditions to keep the boid within the specified bounds.
     * @param {Object} boid - The boid to which periodic boundary conditions are applied.
     */
    periodicBoundary(boid) {
        const axes = ['x', 'y', 'z'];

        axes.forEach(axis => {
            if (boid.position[axis] < 0){
                boid.position[axis] += this.bound[axis];
            }
            if (boid.position[axis] > this.bound[axis]){
                boid.position[axis] -= this.bound[axis]; 
            }
        });
    }

    /**
    * Retrieves all positions of a boid and its shifted positions based on defined shifts.
    * @param {Object} boid - The boid whose positions are being retrieved.
    * @returns {Array} - Array containing the original position of the boid and its shifted positions.
    */
    getAllPos(boid){
    const shiftedFlocks = [];
    shiftedFlocks.push(boid.position); 
    const shifts = [
        { x: 1, y: 0, z: 0 },
        { x: -1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 0, y: -1, z: 0 },
        { x: 0, y: 0, z: 1 },
        { x: 0, y: 0, z: -1 },
    ];
    shifts.forEach(shift => {
        const shiftedPos = new THREE.Vector3(
            boid.position.x + shift.x * this.bound.x,
            boid.position.y + shift.y * this.bound.y,
            boid.position.z + shift.z * this.bound.z
        );
        shiftedFlocks.push(shiftedPos);
    });
    return shiftedFlocks;
    }

    /**
    * Creates a dictionary mapping each boid to a 20x20x20 box within the simulation area
    * @param {Object} flock - The flock of boids.
    * @returns {Array} - A dictionary where each key is a grid coord and each value is a list of boids within that coord.
    */
    createGridDictionary(flock){
        const grid = {};

        flock.forEach(boid => {
            const gridKey = this.generateGridKey(boid);

            if (!grid[gridKey]) {
                grid[gridKey] = [];
            }
            grid[gridKey].push(boid)
        });
        return grid;
    }

    /**
    * Creates the key used to reference the grid position that a boid is in
    * @param {Object} boid - The boids.
    * @returns {string} - A dictionary key referencing the grid coord of the boid.
    */
    generateGridKey(boid){
        const gridSize = this.gridSize;
        const gridX = Math.floor((boid.position.x / boid.vision) / gridSize);
        const gridY = Math.floor((boid.position.y / boid.vision) / gridSize);
        const gridZ = Math.floor((boid.position.z / boid.vision) / gridSize);

        const maxX = Math.floor((this.bound.x / boid.vision) / gridSize);
        const maxY = Math.floor((this.bound.y / boid.vision) / gridSize);
        const maxZ = Math.floor((this.bound.z / boid.vision) / gridSize);  

        return {
            gridKey : `${gridX}_${gridY}_${gridZ}`, 
            maxArr: [(gridX == maxX || gridX == 0),(gridY == maxY || gridY == 0), (gridZ == maxZ || gridZ == 0)]
        };
    }


    /**
     * Resets the simulation and cycles through variations on the boid parameters
     */
    reset(){
        console.log("config for run");
        const boid = this.flock[0];
        console.log("FOV: ", Math.round((360 * (boid.fov + (Math.PI / 2))) / Math.PI));
        console.log("Max Speed: ", boid.maxSpeed);
        console.log("Max Vision: ", boid.vision);
        console.log("Collision Positions ", this.collisionPos);
        console.log("Average Polarisation: ", this.polarisation / this.polarTotal)


        this.fovCounter++;
        if (this.maxSpeedCounter == boid.maxSpeeds.lenght) {this.visionCounter++; this.maxSpeedCounter = 0; this.fovCounter = 0;}
        if  (this.fovCounter == boid.fovs.length) {this.maxSpeedCounter++; this.fovCounter = 0;}
        
        for(var i=0;i<this.flock.length;i++){
            const boid = this.flock[i]; 
            
            if (boid.dead){
                boid.dead = true;
            }
            boid.resetPositions(this.bound);
            this.collisionNum = 0;

            boid.updateFOV(this.fovCounter);
            
            if (this.fovCounter == 0){
                boid.updateMaxSpeed(this.maxSpeedCounter);
            }
            
            if (this.maxSpeedCounter == 0){
                boid.updateVisionRange(this.visionCounter);
            }
        }
        console.log("resetting flock and updating parmeters...");
    }
}
