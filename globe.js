import * as THREE from "https://unpkg.com/three@0.166.1/build/three.module.js";

const container = document.getElementById("globe3d");

if(container){

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
45,
container.clientWidth/container.clientHeight,
0.1,
1000
);

camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({
alpha:true,
antialias:true
});

renderer.setPixelRatio(window.devicePixelRatio);

renderer.setSize(
container.clientWidth,
container.clientHeight
);

container.appendChild(renderer.domElement);

/*==============================
EARTH
==============================*/

const loader = new THREE.TextureLoader();

const earthTexture =
loader.load("https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg");

const geometry =
new THREE.SphereGeometry(1,64,64);

const material =
new THREE.MeshStandardMaterial({

map:earthTexture,

roughness:.9,

metalness:.05

});

const earth =
new THREE.Mesh(
geometry,
material
);

scene.add(earth);

/*==============================
ATMOSPHERE
==============================*/

const atmosphere =
new THREE.Mesh(

new THREE.SphereGeometry(1.06,64,64),

new THREE.MeshBasicMaterial({

color:0x4da3ff,

transparent:true,

opacity:.15,

side:THREE.BackSide

})

);

scene.add(atmosphere);

/*==============================
LIGHTS
==============================*/

scene.add(

new THREE.AmbientLight(
0xffffff,
1.3
)

);

const sun =
new THREE.DirectionalLight(
0xffffff,
3
);

sun.position.set(5,2,5);

scene.add(sun);

/*==============================
STARS
==============================*/

const stars =
new THREE.BufferGeometry();

const starVertices=[];

for(let i=0;i<5000;i++){

starVertices.push(

(Math.random()-0.5)*200,

(Math.random()-0.5)*200,

(Math.random()-0.5)*200

);

}

stars.setAttribute(

'position',

new THREE.Float32BufferAttribute(

starVertices,

3

)

);

const starMaterial =
new THREE.PointsMaterial({

color:0xffffff,

size:.18

});

const starField =
new THREE.Points(
stars,
starMaterial
);

scene.add(starField);

/*==============================
RINGS
==============================*/

for(let i=0;i<3;i++){

const ring =
new THREE.Mesh(

new THREE.TorusGeometry(
1.7+i*.18,
0.01,
8,
150
),

new THREE.MeshBasicMaterial({

color:0x2f80ff,

transparent:true,

opacity:.18

})

);

ring.rotation.x =
Math.PI/2;

ring.rotation.y =
i*.5;

scene.add(ring);

}

/*==============================
MOUSE
==============================*/

let mouseX=0;
let mouseY=0;

window.addEventListener("mousemove",e=>{

mouseX=
(e.clientX/window.innerWidth-.5);

mouseY=
(e.clientY/window.innerHeight-.5);

});

/*==============================
ANIMATION
==============================*/

function animate(){

requestAnimationFrame(animate);

earth.rotation.y+=0.0025;

atmosphere.rotation.y+=0.0028;

camera.position.x+=
(mouseX*0.5-camera.position.x)*0.02;

camera.position.y+=
(-mouseY*0.5-camera.position.y)*0.02;

camera.lookAt(earth.position);

renderer.render(
scene,
camera
);

}

animate();

/*==============================
RESPONSIVE
==============================*/

window.addEventListener("resize",()=>{

camera.aspect=
container.clientWidth/
container.clientHeight;

camera.updateProjectionMatrix();

renderer.setSize(

container.clientWidth,

container.clientHeight

);

});

}
