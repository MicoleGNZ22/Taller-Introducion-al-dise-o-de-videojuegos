import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// 1. ESCENA
const scene = new THREE.Scene();

// 2. CÁMARA
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 6); // Ajustada un poco al centro para seguir el movimiento en X e Y

// 3. RENDERIZADOR
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// RELOJ PARA EL DELTA TIME
const clock = new THREE.Clock();

// Variable global para guardar nuestro modelo una vez que cargue
let miModelo3D = null;

// ==========================================
// 4. CARGADOR DE MODELOS 3D (GLTF / GLB)
// ==========================================
const loader = new GLTFLoader();

loader.load(
'/models/animal.glb',
(gltf) => {
miModelo3D = gltf.scene;
miModelo3D.scale.set(1, 1, 1);
scene.add(miModelo3D);
console.log("¡Modelo 3D cargado con éxito!");
},
(xhr) => {
console.log((xhr.loaded / xhr.total * 100) + '% cargado');
},
(error) => {
console.error('Hubo un error al cargar el modelo:', error);
}
);

// LUCES
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// Diccionario para registrar qué teclas están presionadas
const keys = {
w: false,
a: false,
s: false,
d: false,
b: false,
n: false,
m: false,
v: false,
shift: false
};

// 5. BUCLE DE ANIMACIÓN (Game Loop)
function animate() {
requestAnimationFrame(animate);

// Usamos el reloj para que el movimiento sea fluido e independiente de los FPS
const deltaTime = clock.getDelta(); 

// === CRUCIAL: Solo hacemos cosas si el modelo YA EXISTE ===
if (miModelo3D) {
        
// 1. CALCULAR VELOCIDAD (Multiplicamos por deltaTime para estabilizar la velocidad)
let currentSpeed = 4 * deltaTime; 
if (keys.shift) {
currentSpeed = 9 * deltaTime; // Velocidad de Sprint
}
// --- MECÁNICA DE MOVIMIENTO ---
if (keys.w) miModelo3D.position.z += currentSpeed; // Arriba
if (keys.s) miModelo3D.position.z -= currentSpeed; // Abajo
if (keys.a) miModelo3D.position.x -= currentSpeed; // Izquierda
if (keys.d) miModelo3D.position.x += currentSpeed; // Derecha

if (keys.b) miModelo3D.position.y += currentSpeed; // Arriba
if (keys.v) miModelo3D.position.y -= currentSpeed; // Abajo
if (keys.n) miModelo3D.position.x -= currentSpeed; // Izquierda
if (keys.m) miModelo3D.position.x += currentSpeed; // Derecha
// --- LIMITAR LA POSICIÓN (Lógica de colisión con el borde) ---
if (miModelo3D.position.x > 5) {
miModelo3D.position.x = 5;
} else if (miModelo3D.position.x < -5) {
miModelo3D.position.x = -5;
}
if (miModelo3D.position.y > 3) {
miModelo3D.position.y = 3;
} else if (miModelo3D.position.y < -3)
{
miModelo3D.position.y = -3;
}

// Mantener una leve rotación opcional si lo deseas
//miModelo3D.rotation.y += 0.5 * deltaTime;

}
renderer.render(scene, camera);
}

animate();

// 6. AJUSTE DE PANTALLA
window.addEventListener('resize', () => {
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth, window.innerHeight);
});

// Detectar cuando se presiona la tecla
window.addEventListener('keydown', (event) => {
let key = event.key.toLowerCase();

// Si presionaron cualquier Shift, lo normalizamos a 'shift'
if (key === 'shift') key = 'shift';

if (key in keys) {
keys[key] = true;
}
});

window.addEventListener('keyup', (event) => {
let key = event.key.toLowerCase();

if (key === 'shift') key = 'shift';

if (key in keys) {
keys[key] = false;
}
});


