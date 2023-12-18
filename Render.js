export default class SimpleRenderer {
    /**
     * Represents the renderer.
     * @param {Array} flock - The flock array containing boids of this species.
     * @param {Object} bound - The bound object containing the x,y,z dimensions of the simulation area
     */
    constructor(bound, flock) {  
        this.flock = flock
        this.bound = bound;
        this.degX = 90;
        this.degY = 75;
        this.cameraMax = Math.max(this.bound.x, this.bound.y, this.bound.z);
        this.cameraRadius = this.cameraMax*2/3;
    }

    /**
    * Initializes the THREE.js scene, camera, renderer, and sets up event listeners.
    */
    init() {
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 100000 );     
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xffffff );
        this.entityGeometry = new THREE.BoxGeometry( 5, 5, 15 );

        const geometry = new THREE.BoxGeometry(this.bound.x, this.bound.y, this.bound.z);
        const wireframe = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(wireframe);
        
        line.material.color = new THREE.Color( 0x000000 );
        line.material.transparent = false;
        line.position.x = this.bound.x/2;
        line.position.y = this.bound.y/2;
        line.position.z = this.bound.z/2;
        this.scene.add(line);
     
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.renderer.domElement.addEventListener('wheel', this.onMouseWheel.bind(this));

        this.updateCamera();
        this.render();
    }

    /**
     * Handles the 'wheel' event to adjust the camera's X rotation based on mouse wheel movement.
     * @param {WheelEvent} e - The event object representing the mouse wheel event.
     */
    onMouseWheel( e ) {
        e.preventDefault();
        this.degX += e.deltaY * 0.1;
        this.updateCamera();
    }

    /**
     * Updates the camera's position and orientation based on degrees of rotation.
     */
    updateCamera() {
        let mx=0, my=0, mz=0;
        mx = this.bound.x/2;
        my = this.bound.y/4;
        mz = this.bound.z/2;

        const degXPI = this.degX*Math.PI/180; 
        const degYPI = this.degY*Math.PI/180; 

        this.camera.position.x = mx + Math.sin(degXPI)*Math.sin(degYPI)*this.cameraRadius;
        this.camera.position.z = mz + Math.cos(degXPI)*Math.sin(degYPI)*this.cameraRadius;
        this.camera.position.y = my + Math.cos(degYPI)*this.cameraRadius;

        this.camera.lookAt(mx, my, mz);
    }


    /**
     * Renders the scene with boids and windmills in their current state.
     */
    render() {   

        const boids = this.flock.getFlock();
        boids.forEach(boid => {  
            if (boid.dead){
                this.scene.add(boid.deadMesh);
                this.scene.remove(boid.mesh);
                boid.deadMesh.position.x = boid.mesh.position.x;
                boid.deadMesh.position.y = boid.mesh.position.y;
                boid.deadMesh.position.z = boid.mesh.position.z;
            }  else{
                this.scene.add(boid.mesh);
                boid.mesh.position.x = boid.position.x;
                boid.mesh.position.y = boid.position.y;
                boid.mesh.position.z = boid.position.z;            
            }
        });

        const mills = this.flock.getWindmills();
        mills.forEach(mill => {
            this.scene.add(mill.mesh);
            mill.mesh.position.x = mill.position.x;
            mill.mesh.position.y = mill.position.y;
            mill.mesh.position.z = mill.position.z;            
        });

        this.renderer.render(this.scene, this.camera);
    }
}
