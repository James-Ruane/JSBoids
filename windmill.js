export default class Windmill{
    constructor(x,y,z, d, h, w, bound){
        this.depth = d;
        this.height = h;
        this.width = w;
        this.x = x;
        this.y = y;
        this.z = z;
        this.geometry = new THREE.BoxGeometry( this.depth, this.height, this.width);    
        this.material = new THREE.MeshBasicMaterial( { color: 0x000000 } ); 
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.position = new THREE.Vector3(this.x,this.y,this.z);
        this.points = this.getPoints();
        this.minZ = this.position.z - this.width / 2;
        this.maxZ = this.position.z + this.width / 2;

        this.TRX = 0
        this.TRY = 0
        this.TLX = 0;
        this.TLY = 0;

        this.BLX = 0
        this.BLY = 0
        this.BRX = 0;
        this.BRY = 0;

        this.rotation = 1.5;
    }

    update(){
        const x = this.x;
        const y = this.y;

        this.mesh.rotation.z = this.mesh.rotation.z - 0.01;

        this.TRX = (x * Math.sin(this.rotation)+x);
        this.TRY = (x * Math.cos(this.rotation)+y);
        this.TLX = (x * Math.sin(this.rotation - Math.PI + 0.15)+x);
        this.TLY = (x * Math.cos(this.rotation - Math.PI + 0.15))+y;
        
        this.BLX = (x * Math.sin(this.rotation - Math.PI)+x)
        this.BLY = (x * Math.cos(this.rotation - Math.PI)+y);
        this.BRX = (x * Math.sin(this.rotation + 0.15)+x);
        this.BRY = (x * Math.cos(this.rotation + 0.15)+y);

        this.rotation += 0.01;
        this.rotation = this.rotation % (2 * Math.PI);
    }

    getPoints(){
        const radius = this.depth / 2;
        const TRX = (radius * Math.sin(Math.PI / 2)+this.x);
        const BLX = this.position.x;
        const maxZ = this.z + this.width / 2;
        const minZ = this.z - this.width / 2
        var sprCoef = 0;
        var points = [];

        for (var h=minZ; h<maxZ; h++) {
            for (var i=BLX; i<TRX; i+=3){
                sprCoef += 2 * Math.PI / (TRX - BLX);
                for (var j=sprCoef; j<sprCoef + 2*Math.PI; j+= 0.1){
                    points.push([((i - BLX) * Math.sin(j)+this.x), ((i - BLX) * Math.cos(j)+this.y), h])
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

