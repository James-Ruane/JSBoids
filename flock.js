export default class Flock{
    constructor(bound){
        this.flock = [];
        this.bound = bound;

        this.allignWeight = 1;
        this.cohesionWeight = 0.02;
        this.separationWeight = 0.2;
        this.avoidWeight = 1;
    }

    pushToFlock(boid){
        this.flock.push(boid);
    }

    getFlock(){
        return this.flock;
    }

    iterate(){
        for(var i=0;i<this.flock.length;i++){
            const boid = this.flock[i];
            this.edges(boid);
            this.flocking(boid);
            boid.update();
        }
    }

    flocking(boid){
        let acceleration = new THREE.Vector3(0,0,0);
        
        
        let avoid = this.edge(boid);
        let avgA = this.allign(boid);
        let avgC = this.cohes(boid);
        let avgS = this.sep(boid);
        acceleration = acceleration.add(avgA.multiplyScalar(this.allignWeight));
        acceleration = acceleration.add(avgC.multiplyScalar(this.cohesionWeight));
        acceleration = acceleration.add(avgS.multiplyScalar(this.separationWeight));
        acceleration = acceleration.add(avoid.multiplyScalar(this.avoidWeight));
        boid.acceleration = acceleration
    }


    allign(boid){
        let avgA = new THREE.Vector3(0,0,0);
        let total = 0;

        this.flock.forEach(i => {
            if (boid != i && 
                boid.position.distanceTo(i.position) < boid.vision) {
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

    cohes(boid){
        let avgC = new THREE.Vector3(0,0,0);
        let total = 0;
        this.flock.forEach(i => {
            if (boid != i && 
                boid.position.distanceTo(i.position) < boid.vision) {
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

    sep(boid){
        let avgS = new THREE.Vector3(0,0,0);
        this.flock.forEach(i => {
        let dist = boid.position.distanceTo(i.position);
        if (dist <= 0){
            dist = 0.01;
        } 
        if (boid != i && dist < boid.vision) {

            let sx = boid.position.x - i.position.x;
            let sy = boid.position.y - i.position.y;
            let sz = boid.position.z - i.position.z;

            avgS.x += (sx / dist) / dist;
            avgS.y += (sy / dist) / dist;
            avgS.z += (sz / dist) / dist;

        }});
        return avgS;

    }

    edge(boid){
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

    edges(boid) {

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

}




