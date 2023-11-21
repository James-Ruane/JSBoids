export default class Windmill{
    constructor(x,y,z){
        this.geometry = new THREE.BoxGeometry( 125, 10, 10 );    
        this.material = new THREE.MeshBasicMaterial( { color: 0x000000 } ); 
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.position = new THREE.Vector3(x,y,z);
    }

    update(){
        this.position.y -= 0.5;
    }


    random(min, max){
        const difference = max - min
        const random = Math.round(difference * Math.random())
        return random + min
    }
}

