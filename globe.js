import * as THREE from "https://unpkg.com/three@0.166.1/build/three.module.js";

const container = document.getElementById("globe3d");

if (!container) {
    throw new Error("globe3d container not found.");
}

/*==========================
SCENE
==========================*/

const scene = new THREE.Scene();

scene.background = null;

const camera = new THREE.PerspectiveCamera(

40,

container.clientWidth / container.clientHeight,

0.1,

1000

);

camera.position.set(0,0,4);

/*==========================
RENDERER
==========================*/

const renderer = new THREE.WebGLRenderer({

alpha:true,

antialias:true

});

renderer.setPixelRatio(window.devicePixelRatio);

renderer.setSize(

container.clientWidth,

container.clientHeight

);

renderer.outputColorSpace = THREE.SRGBColorSpace;

container.appendChild(renderer.domElement);

/*==========================
LIGHTS
==========================*/

const ambient = new THREE.AmbientLight(

0x6d5eff,

1.8

);

scene.add(ambient);

const sun = new THREE.DirectionalLight(

0xffffff,

2.8

);

sun.position.set(

5,

4,

6

);

scene.add(sun);

/*==========================
TEXTURES
==========================*/

const loader = new THREE.TextureLoader();

const earthMap = loader.load(

"https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"

);

const bumpMap = loader.load(

"https://threejs.org/examples/textures/planets/earth_normal_2048.jpg"

);

const specularMap = loader.load(

"https://threejs.org/examples/textures/planets/earth_specular_2048.jpg"

);

/*==========================
EARTH
==========================*/

const earthGeometry = new THREE.SphereGeometry(
1,
128,
128
);

const earthMaterial = new THREE.MeshPhongMaterial({

map: earthMap,

bumpMap: bumpMap,

bumpScale: 0.05,

specularMap: specularMap,

specular: new THREE.Color(0x555555),

shininess: 35,

emissive: new THREE.Color(0x6f3cff),

emissiveIntensity: 0.25

});

const earth = new THREE.Mesh(
earthGeometry,
earthMaterial
);

scene.add(earth);

/*==========================
ATMOSPHERE
==========================*/

const atmosphereGeometry =
new THREE.SphereGeometry(
1.05,
128,
128
);

const atmosphereMaterial =
new THREE.ShaderMaterial({

vertexShader:`

varying vec3 vNormal;

void main(){

vNormal=normalize(normalMatrix*normal);

gl_Position=
projectionMatrix*
modelViewMatrix*
vec4(position,1.0);

}

`,

fragmentShader:`

varying vec3 vNormal;

void main(){

float intensity=
pow(
0.7-dot(vNormal,vec3(0.0,0.0,1.0)),
4.0
);

gl_FragColor=
vec4(
0.48,
0.25,
1.0,
1.0
)*intensity;

}

`,

blending:THREE.AdditiveBlending,

side:THREE.BackSide,

transparent:true

});

const atmosphere =
new THREE.Mesh(

atmosphereGeometry,

atmosphereMaterial

);

scene.add(atmosphere);

/*==========================
ORBIT RINGS
==========================*/

const orbitGroup = new THREE.Group();

scene.add(orbitGroup);

function createOrbit(radius, rotationX, rotationY){

const geometry = new THREE.TorusGeometry(

radius,

0.006,

16,

240

);

const material = new THREE.MeshBasicMaterial({

color:0x6f5cff,

transparent:true,

opacity:0.55

});

const orbit = new THREE.Mesh(

geometry,

material

);

orbit.rotation.x = rotationX;

orbit.rotation.y = rotationY;

orbitGroup.add(orbit);

}

createOrbit(1.45,Math.PI/2.8,0);
createOrbit(1.65,Math.PI/2.3,0.8);
createOrbit(1.85,Math.PI/2.1,-0.7);
createOrbit(2.05,Math.PI/2.5,1.3);

/*==========================
GLOWING NODES
==========================*/

const nodeGeometry = new THREE.SphereGeometry(
0.025,
16,
16
);

const nodeMaterial = new THREE.MeshBasicMaterial({

color:0x8d6bff

});

const nodes=[];

for(let i=0;i<12;i++){

const node=new THREE.Mesh(

nodeGeometry,

nodeMaterial

);

const radius=1.65+(Math.random()*0.45);

const angle=Math.random()*Math.PI*2;

node.userData={

radius,

angle,

speed:0.003+Math.random()*0.004

};

orbitGroup.add(node);

nodes.push(node);

}

/*==========================
STARS
==========================*/

const starsGeometry = new THREE.BufferGeometry();

const vertices=[];

for(let i=0;i<2500;i++){

vertices.push(

(Math.random()-0.5)*120,

(Math.random()-0.5)*120,

(Math.random()-0.5)*120

);

}

starsGeometry.setAttribute(

"position",

new THREE.Float32BufferAttribute(vertices,3)

);

const starsMaterial = new THREE.PointsMaterial({

color:0xffffff,

size:0.08,

transparent:true,

opacity:0.8

});

const stars = new THREE.Points(

starsGeometry,

starsMaterial

);

scene.add(stars);

/*==========================
MOUSE CONTROL
==========================*/

let mouseX = 0;
let mouseY = 0;

window.addEventListener("mousemove",(event)=>{

mouseX = (event.clientX / window.innerWidth - 0.5);

mouseY = (event.clientY / window.innerHeight - 0.5);

});

/*==========================
CLOCK
==========================*/

const clock = new THREE.Clock();

/*==========================
ANIMATION
==========================*/

function animate(){

requestAnimationFrame(animate);

const elapsed = clock.getElapsedTime();

/* Earth */

earth.rotation.y += 0.0025;

/* Atmosphere */

atmosphere.rotation.y += 0.0028;

/* Orbit Group */

orbitGroup.rotation.y += 0.0015;

/* Orbit Nodes */

nodes.forEach(node=>{

node.userData.angle += node.userData.speed;

node.position.x =
Math.cos(node.userData.angle) *
node.userData.radius;

node.position.z =
Math.sin(node.userData.angle) *
node.userData.radius;

node.position.y =
Math.sin(
elapsed +
node.userData.angle * 2
) * 0.15;

});

/* Stars */

stars.rotation.y += 0.00015;

/* Camera Movement */

camera.position.x +=
(mouseX * 0.45 - camera.position.x) * 0.03;

camera.position.y +=
(-mouseY * 0.35 - camera.position.y) * 0.03;

camera.lookAt(earth.position);

renderer.render(scene,camera);

}

animate();

/*==========================
RESPONSIVE
==========================*/

window.addEventListener("resize",()=>{

camera.aspect =
container.clientWidth /
container.clientHeight;

camera.updateProjectionMatrix();

renderer.setSize(

container.clientWidth,

container.clientHeight

);

});

/*==========================
PREMIUM GLOW
==========================*/

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;

const glowLight = new THREE.PointLight(
0x7f5cff,
8,
10
);

glowLight.position.set(2,2,2);

scene.add(glowLight);

/*==========================
GLOW PULSE
==========================*/

function glowPulse(){

const pulse =
1 + Math.sin(Date.now()*0.0015)*0.08;

earth.scale.set(
pulse,
pulse,
pulse
);

atmosphere.scale.set(
pulse*1.01,
pulse*1.01,
pulse*1.01
);

requestAnimationFrame(glowPulse);

}

glowPulse();

/*==========================
EARTH TILT
==========================*/

earth.rotation.z = THREE.MathUtils.degToRad(23.5);

/*==========================
ORBIT SPEED
==========================*/

orbitGroup.children.forEach((orbit,index)=>{

orbit.rotation.z =
index * 0.6;

});
