export default class Windmill{

    /**
     * Represents a windmill object.
     * @param {number} x - The windmills x coordinate
     * @param {number} y - The windmills y coordinate
     * @param {number} z - The windmills z coordinate
     * @param {number} d - The windmills depth
     * @param {number} h - The windmills height
     * @param {number} w - The windmills width
     */
    constructor(x,y,z, d, h, w, bound, r){
        //depth, width, height of windmill
        this.depth = d;
        this.height = h;
        this.width = w;
        // position of centre of windmill
        this.x = x;
        this.y = y;
        this.z = z;
        this.position = new THREE.Vector3(this.x,this.y,this.z);
        // threeJS materials
        this.geometry = new THREE.BoxGeometry( this.depth, this.height, this.width);    
        this.material = new THREE.MeshBasicMaterial( { color: 0x000000 } ); 
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        // gets points in windmill trajectory
        this.points = this.getPoints();
        this.r = r

        // gets max X, Y, Z or windmills. i.e. topLeft, topRight, bottomRight, bottomLeft corners
        this.minZ = this.position.z - this.width / 2;
        this.maxZ = this.position.z + this.width / 2;

        this.TRX = 0;
        this.TRY = 0;
        this.TLX = 0;
        this.TLY = 0;

        this.BLX = 0;
        this.BLY = 0;
        this.BRX = 0;
        this.BRY = 0;

        this.rotation = 1.5;
    }

    /**
     * Updates the windmills position each frame, rotation around a point
     */
    update(){
        const x = this.x;
        const y = this.y;
        let adj = 0
        if (this.r==1){
            adj = Math.PI / 2;
        }

        this.mesh.rotation.z = this.mesh.rotation.z - 0.01;

        this.TRX = (x * Math.sin(this.rotation + adj)+x);
        this.TRY = (x * Math.cos(this.rotation + adj)+y);
        this.TLX = (x * Math.sin(this.rotation - Math.PI + 0.15 + adj)+x);
        this.TLY = (x * Math.cos(this.rotation - Math.PI + 0.15 + adj))+y;
        
        this.BLX = (x * Math.sin(this.rotation - Math.PI + adj)+x);
        this.BLY = (x * Math.cos(this.rotation - Math.PI + adj)+y);
        this.BRX = (x * Math.sin(this.rotation + 0.15 + adj)+x);
        this.BRY = (x * Math.cos(this.rotation + 0.15 + adj)+y);

        this.rotation += 0.01;
        this.rotation = this.rotation % (2 * Math.PI);
    }

    /**
     * Creates a list of points that are contained within the windmills trajectory
     * @returns {Array} - array of points contained within the windmills trajectory
     */
    getPoints(){
        const radius = this.depth / 2;
        const TRX = (radius * Math.sin(Math.PI / 2)+this.x);
        const BLX = this.position.x;
        const maxZ = this.z + this.width / 2;
        const minZ = this.z - this.width / 2;
        var sprCoef = 0;
        var points = [];

        for (var h=minZ; h<maxZ; h++) {
            for (var i=BLX; i<TRX; i+=3){
                sprCoef += 2 * Math.PI / (TRX - BLX);
                for (var j=sprCoef; j<sprCoef + 2*Math.PI; j+= 0.1){
                    points.push([((i - BLX) * Math.sin(j)+this.x), ((i - BLX) * Math.cos(j)+this.y), h]);
                }
            }
        }
        return points;
    }

    /**
    * Checks if a given point is within the boundaries of a windmill.
    * @param {number} x - The x-coordinate of the point.
    * @param {number} y - The y-coordinate of the point.
    * @param {number} z - The z-coordinate of the point.
    * @returns {boolean} - Indicates whether the point is within the windmill's boundaries.
    */
    pointInWindmill(x, y, z){
        const minZ = this.position.z - this.width / 2;
        const maxZ = this.position.z + this.width / 2;
        const line1 = {
            a: (this.TLY - this.TRY) / (this.TLX - this.TRX),
            b: this.TRY - ((this.TLY - this.TRY) / (this.TLX - this.TRX)) * this.TRX
        };
        const line2 = {
            a: (this.BRY - this.BLY) / (this.BRX - this.BLX),
            b: this.BLY - ((this.BRY - this.BLY) / (this.BRX - this.BLX)) * this.BLX
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
        return false;
    }   
    

    /**
     * Generates a random number between a given min and max value
     * @param {number} max - The maximum value
     * @param {number} min - The minimum value
     * @returns {number} - random number between min and max
     */
    random(min, max){
        const difference = max - min;
        const random = Math.round(difference * Math.random());
        return random + min;
    }
}

