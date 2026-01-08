import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { world, groundBody, cubeBody } from './functions/physics.js';
import { keysPressed, updateCubePosition, jump } from './functions/movement.js';
import { loadModel } from './functions/models.js';

// URLs for level squares
const levels = {
    level1: "../Levels/1.html",
    level2: "../Levels/2.html",
    level3: "../Levels/3.html"
};

// Function to check if a level file is valid
async function isLevelReachable(url) {
    try {
        const response = await fetch(url, { method: 'GET' });

        if (!response.ok) {
            console.error(`❌ Level at ${url} returned status: ${response.status}`);
            return false;
        }

        const text = await response.text();
        console.log(`🔍 Response from ${url}:\n`, text.substring(0, 300)); // Log first 300 chars

        // Avoid false positives for invalid pages
        if (text.length < 50 || text.includes("<title>Index of") || text.includes("404")) { 
            console.error(`❌ ${url} is invalid or a fallback page.`);
            return false;
        }

        console.log(`✅ Level at ${url} is valid.`);
        return true;

    } catch (error) {
        console.error(`❌ Failed to connect to ${url}. Error: ${error.message}`);
        return false;
    }
}

// Scene Setup
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 2;
controls.maxDistance = 20;
controls.maxPolarAngle = Math.PI / 2;

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Ground
const ground = new THREE.Mesh(
    new THREE.BoxGeometry(50, 1, 50),
    new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
);
ground.position.y = -0.5;
scene.add(ground);

// Level Squares
const squares = [
    { color: 0xff0000, position: new THREE.Vector3(5, 0, 5), url: levels.level1 },
    { color: 0x0000ff, position: new THREE.Vector3(-5, 0, -5), url: levels.level2 },
    { color: 0x00ff00, position: new THREE.Vector3(10, 0, -10), url: levels.level3 }
];

squares.forEach(({ color, position }) => {
    const square = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.1, 2),
        new THREE.MeshStandardMaterial({ color })
    );
    square.position.copy(position);
    scene.add(square);
});

// Cube
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    [
        new THREE.MeshStandardMaterial({ color: 0xfcf21f }),
        new THREE.MeshStandardMaterial({ color: 0xe31ffc }),
        new THREE.MeshStandardMaterial({ color: 0x30649b }),
        new THREE.MeshStandardMaterial({ color: 0x00ff00 }),
        new THREE.MeshStandardMaterial({ color: 0xff0000 }),
        new THREE.MeshStandardMaterial({ color: 0xfc8a1f })
    ]
);
cube.position.set(0, 1, 0);
scene.add(cube);

async function checkEnterKey() {
    console.log("🔍 Checking if cube is near any square...");

    const cubePosition = cube.position;

    for (const { position, url } of squares) {
        const distance = cubePosition.distanceTo(position);
        console.log(`📏 Distance to square at ${position.x}, ${position.y}, ${position.z}: ${distance}`);

        if (distance < 2) {
            console.log(`✅ Cube is close to a square at ${position.x}, ${position.y}, ${position.z}. Checking level file at ${url}...`);

            const reachable = await isLevelReachable(url);
            if (reachable) {
                console.log(`🚀 Opening level in a new tab: ${url}`);
                window.open(url, "_blank"); // Open in a new tab
            } else {
                console.error(`❌ Cannot enter level: ${url} is missing or inaccessible.`);
                alert(`❌ Cannot enter level: ${url} is missing or inaccessible.`);
            }
            return; // Stop checking after the first valid square
        }
    }

    console.log("❌ Cube is not close enough to any square.");
}

// Keyboard Events
document.addEventListener("keydown", (event) => {
    keysPressed.add(event.key.toLowerCase());
    updateCubePosition();
    if (event.key === " ") jump();
});
document.addEventListener("keyup", (event) => {
    keysPressed.delete(event.key.toLowerCase());
    updateCubePosition();
});
document.addEventListener("keypress", (event) => {
    if (event.key.toLowerCase() === "enter") checkEnterKey();
});

// Raycaster for Selecting Objects
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;

        // ✅ Ensure only Mesh objects are selected
        if (selectedObject instanceof THREE.Mesh) {
            console.log(`🎯 Selected: ${selectedObject.name || "Unnamed Object"}`);
        } else {
            console.warn("⚠ Selected object is not a Mesh. Ignoring.");
        }
    }
}

window.addEventListener('click', onMouseClick, false);

// Prevent Physics from Overriding Movement
function updatePhysics() {
    cube.position.copy(cubeBody.position);
    cube.quaternion.copy(cubeBody.quaternion);
}

// Load 3D Model
loadModel('cube_diorama.glb', (model) => {
    model.position.set(0, 0, 0);
    model.scale.set(1, 1, 1);
    scene.add(model);
}, undefined, (error) => {
    console.error('❌ Error loading model:', error);
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    world.step(1 / 60);
    updatePhysics();
    controls.update();
    renderer.render(scene, camera);
}
animate();
