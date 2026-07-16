/*==============================
  3D GLOBE
==============================*/

const globeContainer = document.getElementById("globe3d");

if(globeContainer){

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(

45,

globeContainer.clientWidth /

globeContainer.clientHeight,

0.1,

1000

);

camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({

antialias:true,

alpha:true

});

renderer.setPixelRatio(window.devicePixelRatio);

renderer.setSize(

globeContainer.clientWidth,

globeContainer.clientHeight

);

globeContainer.appendChild(renderer.domElement);

/* Earth */

const geometry = new THREE.SphereGeometry(

1,

64,

64

);

const material = new THREE.MeshStandardMaterial({

color:0x2f80ff,

metalness:0.2,

roughness:0.7

});

const earth = new THREE.Mesh(

geometry,

material

);

scene.add(earth);

/* Lights */

const light = new THREE.DirectionalLight(

0xffffff,

2

);

light.position.set(

5,

3,

5

);

scene.add(light);

scene.add(

new THREE.AmbientLight(

0x6fa8ff,

1.5

)

);

/* Animation */

function animate(){

requestAnimationFrame(animate);

earth.rotation.y += 0.003;

renderer.render(scene,camera);

}

animate();

/* Resize */

window.addEventListener("resize",()=>{

camera.aspect =

globeContainer.clientWidth/

globeContainer.clientHeight;

camera.updateProjectionMatrix();

renderer.setSize(

globeContainer.clientWidth,

globeContainer.clientHeight

);

});

}
