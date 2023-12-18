export default class Flock{

    /**
     * Represents a flock object.
     * @param {Object} bound - The bound object containing x, y, z dimensions of the simulation area.
     */
    constructor(bound){
        this.bound = bound; // Boundaries object containing x, y, z dimensions
        this.flock = []; // Array to hold boid objects
        this.windmills = []; // Array to hold windmill objects
        this.allignWeight = 1; // Weight for alignment behavior
        this.cohesionWeight = 0.02; // Weight for cohesion behavior
        this.separationWeight = 0.2; // Weight for separation behavior
        this.avoidWeight = 0.5; // Weight for avoidance behavior
        this.endWeight = 0.0005; // Weight for end behavior
        this.endPoint = new THREE.Vector3(62.5, 32.5, 0); // End point for end behavior calculations
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
        for(var i=0;i<this.flock.length;i++){
            const boid = this.flock[i];
            if (!boid.dead) {
                this.periodicBoundary(boid);
                this.flocking(boid);
                boid.update();
                this.collision(boid);
            }
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

        this.flock.forEach(i => {
            var periodicBoids = this.getAllPos(i);
            periodicBoids.forEach(pos => {
                if (boid != i && 
                    boid.position.distanceTo(pos) < boid.vision && this.inFOV(boid, pos.x, pos.y, pos.z) && !(boid.position == pos)) {
                    total ++;
                    avgA.x += i.velocity.x;
                    avgA.y += i.velocity.y;
                    avgA.z += i.velocity.z;
                }
            });
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
        this.flock.forEach(i => {
            var periodicBoids = this.getAllPos(i);
            periodicBoids.forEach(pos => {
                if (boid != i && 
                    boid.position.distanceTo(pos) < boid.vision && this.inFOV(boid, pos.x, pos.y, pos.z) && !(boid.position == pos)){
                    total ++;
                    avgC.x += pos.x;
                    avgC.y += pos.y;
                    avgC.z += pos.z;
                }
            });
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
        this.flock.forEach(i => {
            var periodicBoids = this.getAllPos(i);
            periodicBoids.forEach(pos => {
                let dist = boid.position.distanceTo(pos);
                if (dist <= 0){
                    dist = 0.01;
                } 
                if (boid != i && dist < boid.vision && this.inFOV(boid, pos.x, pos.y, pos.z)  && !(boid.position == pos)) {
                    
                    let sx = boid.position.x - pos.x;
                    let sy = boid.position.y - pos.y;
                    let sz = boid.position.z - pos.z;

                    avgS.x += (sx / dist) / dist;
                    avgS.y += (sy / dist) / dist;
                    avgS.z += (sz / dist) / dist;
                }
            });
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
                if (this.windmillPointInFOV(boid, this.windmills[i], point)){
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
            const mX = boid.mesh.position.x;
            const mY = boid.mesh.position.y;
            const mZ = boid.mesh.position.z;
            if (this.pointInWindmill(mill, mX, mY, mZ)){
                boid.dead=true;
            }
        });
    }
    
    /**
    * Checks if a given point is within the field of view (FOV) of the boid.
    * @param {Object} boid - The boid whose field of view is checked.
    * @param {number} x - The x-coordinate of the point.
    * @param {number} y - The y-coordinate of the point.
    * @param {number} z - The z-coordinate of the point.
    * @returns {boolean} - Indicates whether the point is within the FOV.
    */  
    inFOV(boid, x, y, z){
        const bx = boid.position.x;
        const by = boid.position.y;
        const bz = boid.position.z;
        if(((x - bx)**2 + (y - by)**2 + ((z - bz)**2)) < boid.vision*125){
            if (x - y > 0 && x + y > 0){
                return true;
            }
        }
    }

    /**
    * Checks if a given point is within the field of view (FOV) of the boid and the windmills current area.
    * @param {Object} boid - The boid whose field of view is checked.
    * @param {Object} mill - The windmill object.
    * @param {Array} point - The points coordinates [x, y, z] to be checked.
    * @returns {boolean} - Indicates whether the point is within the FOV and inside the windmills current area
    */  
    windmillPointInFOV(boid, mill, point){    // TODO should test this properly, feels right tho
        const x = point[0];
        const y = point[1];
        const z = point[2]; 
        if (this.pointInWindmill(mill, x, y, z)) {
            if(this.inFOV(boid, x, y, z)){
                return true;     
            }
        }
        return false;
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
    * Checks if a given point is within the boundaries of a windmill.
    * @param {Object} mill - The windmill object.
    * @param {number} x - The x-coordinate of the point.
    * @param {number} y - The y-coordinate of the point.
    * @param {number} z - The z-coordinate of the point.
    * @returns {boolean} - Indicates whether the point is within the windmill's boundaries.
    */
    pointInWindmill(mill, x, y, z){
        const minZ = mill.position.z - mill.width / 2;
        const maxZ = mill.position.z + mill.width / 2;
        const line1 = {
            a: (mill.TLY - mill.TRY) / (mill.TLX - mill.TRX),
            b: mill.TRY - ((mill.TLY - mill.TRY) / (mill.TLX - mill.TRX)) * mill.TRX
        };
        const line2 = {
            a: (mill.BRY - mill.BLY) / (mill.BRX - mill.BLX),
            b: mill.BLY - ((mill.BRY - mill.BLY) / (mill.BRX - mill.BLX)) * mill.BLX
        };
        const isInBetweenLines = (
            (y < ((line1.a * x) + line1.b) && 
            y > ((line2.a * x) + line2.b)) ||
            (y > ((line1.a * x) + line1.b) && 
            y < ((line2.a * x) + line2.b))
        );
        if (isInBetweenLines && z > minZ && z < maxZ) {
            return true;
        }
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
}
