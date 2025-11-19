import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const textureLoader = new THREE.TextureLoader();
const colorTexture = textureLoader.load('/textures/color.jpg');
const normalTexture = textureLoader.load('/textures/normal.jpg');
const roughnessTexture = textureLoader.load('/textures/roughness.jpg');
const metalnessTexture = textureLoader.load('/textures/metalness.jpg');


const material = new THREE.MeshStandardMaterial({
    map: colorTexture,
    normalMap: normalTexture,
    roughnessMap: roughnessTexture,
    metalnessMap: metalnessTexture,
    metalness: 0.5,
    roughness: 0.8
});


const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 64),
    material
);
scene.add(sphere);

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 5, 5);
scene.add(light);

function animate() {
    requestAnimationFrame(animate);

    sphere.rotation.y += 0.01; 
    renderer.render(scene, camera);
}

animate();
