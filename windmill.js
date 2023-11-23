export default class Windmill{
    constructor(x,y,z, bound){
        this.geometry = new THREE.BoxGeometry( 125, 10, 2 );    
        this.material = new THREE.MeshBasicMaterial( { color: 0x000000 } ); 
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.position = new THREE.Vector3(x,y,z);
        this.points = this.getPoints(bound);
    }

    update(){
        //TODO make this update better, i.e. more realistice, would mean the get points function would have to be updated too
        this.position.y -= 0.1;
    }

    getPoints(bound){
        // TODO anywhere where the exact geometry is mentionded needs to be fixed (*)
        const maxX = this.position.x + 125/2;
        const minX = this.position.x - 125/2;
        const maxY = bound.y;
        const minY = 0;
        const minZ = this.position.z - 2/2;
        const maxZ = this.position.z + 2/2;

        const points = [];
        for(var i=minY;i<maxY;i+=10){
            for (var j=minX; j<maxX; j+=5){
                for (var k=minZ; k<maxZ; k++){
                    points.push([i,j,k]);
                }
            }
        }
        return points;
    }


    random(min, max){
        const difference = max - min
        const random = Math.round(difference * Math.random())
        return random + min
    }
}

