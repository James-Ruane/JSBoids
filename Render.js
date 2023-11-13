export default class SimpleRenderer {
   
    constructor(bound, flock) {  
        this.flock = flock
        this.bound = bound;
        this.degX = 90;
        this.degY = 75;
        this.cameraMax = Math.max(this.bound.x, this.bound.y, this.bound.z);
        this.cameraRadius = this.cameraMax*2/3;
    }

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

    onMouseWheel( e ) {
        e.preventDefault();
        this.degX += e.deltaY * 0.1;
        this.updateCamera();
    }


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

    render() {   

        const spheres = this.flock.getFlock();

        spheres.forEach(sphere => {    
            this.scene.add(sphere.mesh);
            sphere.mesh.position.x = sphere.position.x;
            sphere.mesh.position.y = sphere.position.y; 
            sphere.mesh.position.z = sphere.position.z;
        });

        
        this.geometry = new THREE.SphereGeometry( 8, 16, 8 ); 
        this.material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

        this.renderer.render(this.scene, this.camera);
    }
}