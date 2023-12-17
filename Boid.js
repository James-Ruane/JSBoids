export default class Boid{
    // TODO create new species of boid that extends this class, main different will be vision, speed and FOV
    constructor(x,y,z){
        this.geometry = new THREE.SphereGeometry( 1, 64, 32 );    
        this.material = new THREE.MeshBasicMaterial( { color: 0x0000ff } ); 
        this.deadMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } ); 
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.localVelocity = new THREE.Vector3(0,0,0);
       
        this.position = new THREE.Vector3(x,y,z);
        this.velocity = new THREE.Vector3(this.random(-2,2), this.random(-2,2), this.random(-2,0)); // changed to zero so boids start moving in correct direction
        this.acceleration = new THREE.Vector3(this.random(-2, 2), this.random(-2,2), this.random(-2,0));
                
        this.dead = false;        
        this.deadMesh = new THREE.Mesh( this.geometry, this.deadMaterial );

        this.vision = 10;
        this.maxSpeed = 0.3;
        this.maxForce = 0.05;
        
    }

    update(){
        this.position = this.position.add(this.velocity);
        this.velocity = this.velocity.add(this.acceleration);

        let n = Math.sqrt(this.velocity.x**2 + this.velocity.y**2 + this.velocity.z**2);
        let f = Math.min(n, this.maxSpeed) / n;
        this.velocity.set(f * this.velocity.x, f * this.velocity.y, f * this.velocity.z);
    }

    random(min, max){
        const difference = max - min
        const random = Math.round(difference * Math.random())
        return random + min
    }
}

