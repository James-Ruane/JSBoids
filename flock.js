export default class Flock{
    constructor(bound){
        this.flock = [];
        this.windmills = [];
        this.bound = bound;

        this.allignWeight = 1;
        this.cohesionWeight = 0.02;
        this.separationWeight = 0.2;
        this.avoidWeight = 0.5;
        this.endWeight = 0.0005;

        this.endPoint = new THREE.Vector3(62.5, 32.5, 0)
    }

    pushToFlock(boid){
        this.flock.push(boid);
    }

    getFlock(){
        return this.flock;
    }

    pushToWindmills(mill){
        this.windmills.push(mill);
    }

    getWindmills(){
        return this.windmills;
    }

    iterate(){
        for(var i=0;i<this.flock.length;i++){
            const boid = this.flock[i];
            if (!boid.dead) {
                this.periodicBoundary(boid);
                this.flocking(boid);
                boid.update(this.windmills);
                this.collision(boid);
            }
        }
        this.windmillEdge(this.windmills);
    }

    windmillEdge(windmills){
        for (var i=0; i<windmills.length; i++){
            const windmill = windmills[i];
            windmill.update();
            if (windmill.position.y < 0){
                windmill.position.y += this.bound.y;
            }
        }        
    }

    flocking(boid){
        let acceleration = new THREE.Vector3(0,0,0);
        
        let boundAsObj = this.boundAsObj(boid);
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
       // acceleration = acceleration.add(boundAsObj.multiplyScalar(this.avoidWeight));
        boid.acceleration = acceleration
    }

    avoidance(boid){
        const avoid = new THREE.Vector3(0,0,0);
        const pointsInFOV = [];
        for(var i=0; i<this.windmills.length; i++){
            for (var j=0; j<this.windmills[i].points.length; j++){
                const point = this.windmills[i].points[j];
                if (this.windmillPointInFOV(boid, this.windmills[i], point)){
                    pointsInFOV.push(point);
                }
            }
        }
        if (pointsInFOV.length > 0){
            // TODO maybe find the closest point to the boid, instead of first
            const distance =  Math.sqrt((boid.position.x - pointsInFOV[0][0])**2 + (boid.position.y - pointsInFOV[0][1])**2 + (boid.position.z - pointsInFOV[0][2])**2)
            const oy = boid.position.y - pointsInFOV[0][1];
            avoid.y += (oy/distance)/distance;
        }
        return avoid;
    }

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

    windmillPointInFOV(boid, mill, point){
        const x = point[0];
        const y = point[1];
        const z = point[2]; 

        // TODO should test this properly, feels right tho
        if (this.pointInWindmill(mill, x, y, z)) {
            if(this.inFOV(boid, x, y, z)){
                //point is in windmill and in boid radius and within fov planes
                return true;     
            }
        }
        return false;
    }
            
    
    collision(boid){

        this.windmills.forEach(mill => {
            const mX = boid.mesh.position.x;
            const mY = boid.mesh.position.y;
            const mZ = boid.mesh.position.z;

            if (this.pointInWindmill(mill, mX, mY, mZ)){
                boid.dead=true;
            }
        })
    }

    end(boid){
        let avgC = new THREE.Vector3(this.endPoint.x , this.endPoint.y, this.endPoint.z);
        avgC.set(avgC.x - boid.position.x, avgC.y - boid.position.y, avgC.z - boid.position.z);
        const allignMag = Math.sqrt(avgC.x**2 + avgC.y**2 + avgC.z**2);
        avgC.set(avgC.x / allignMag, avgC.y / allignMag, avgC.z / allignMag);
        return avgC;
    }

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

    boundAsObj(boid){
        let avoid = new THREE.Vector3(0,0,0);

        const radius = 5;
        const distX = this.bound.x - boid.position.x;
        const distY = this.bound.y - boid.position.y;
        const distZ = this.bound.z - boid.position.z;

        if(boid.position.x < radius && Math.abs(boid.position.x) > 0) {
            avoid.x += 1/boid.position.x;
        } else if(distX < radius && distX > 0) {
            avoid.x -= 1/distX;
        }
        if(boid.position.y < radius && Math.abs(boid.position.y) > 0) {
            avoid.y += 1/boid.position.y;
        } else if(distY < radius && distY > 0) {
            avoid.y -= 1/distY;
        }
        if(boid.position.z < radius && Math.abs(boid.position.z) > 0) {
            avoid.z += 1/boid.position.z;
        } else if(distZ < radius && distZ > 0) {
            avoid.z -= 1/distZ;
        }

        return avoid;
    }

    periodicBoundary(boid) {

        if (boid.position.x < 0){
            boid.position.x += this.bound.x;
        }
        if (boid.position.x > this.bound.x){
            boid.position.x -= this.bound.x; 
        }

        if (boid.position.y < 0){
            boid.position.y += this.bound.y;
        }
        if (boid.position.y > this.bound.y){
            boid.position.y -= this.bound.y; 
        }

        if (boid.position.z < 0){
            boid.position.z += this.bound.z;
        }
        if (boid.position.z > this.bound.z){
            boid.position.z -= this.bound.z; 
        }

    }

    pointInWindmill(mill, x, y, z){
        const TRX = mill.TRX
        const TRY = mill.TRY
        const BLX = mill.BLX
        const BLY = mill.BLY
        const TLX = mill.TLX
        const TLY = mill.TLY
        const BRX = mill.BRX
        const BRY = mill.BRY
        const minZ = mill.position.z - mill.width / 2;
        const maxZ = mill.position.z + mill.width / 2;

        const a = (TLY-TRY) / (TLX-TRX)
        const b = TRY - (a * TRX)

        const a2 = (BRY-BLY) / (BRX-BLX)
        const b2 = BLY - (a2 * BLX)

        if (((y < ((a * x) + b)) && ((y > ((a2 * x) + b2)))) || (y > ((a * x) + b)) && ((y < ((a2 * x) + b2)))) {
            if(z > minZ && z < maxZ){
                return true;
            }
        }
    }   

    getAllPos(boid){
        const shiftedFlocks = [];
        const x = this.bound.x;
        const y = this.bound.y;
        const z = this.bound.z;

        var tempPosX = boid.position.x;
        var tempPosY = boid.position.y;
        var tempPosZ = boid.position.z;
        
        shiftedFlocks.push(new THREE.Vector3(tempPosX, tempPosY, tempPosZ));
        shiftedFlocks.push(new THREE.Vector3(tempPosX + x, tempPosY, tempPosZ));
        shiftedFlocks.push(new THREE.Vector3(tempPosX - x, tempPosY, tempPosZ));
        shiftedFlocks.push(new THREE.Vector3(tempPosX, tempPosY + y, tempPosZ));
        shiftedFlocks.push(new THREE.Vector3(tempPosX, tempPosY - y, tempPosZ));
        shiftedFlocks.push(new THREE.Vector3(tempPosX, tempPosY, tempPosZ + z));
        shiftedFlocks.push(new THREE.Vector3(tempPosX, tempPosY, tempPosZ - z));

        return shiftedFlocks;
    } 
}

