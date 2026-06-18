import './style.css'; // <--- ¡Añade esta línea para que limpie la pantalla!
import * as THREE from 'three';

// 1. ESCENA
const scene = new THREE.Scene();

// 2. CÁMARA
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// 3. RENDERIZADOR
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 4. CUBO
const geometry = new THREE.OctahedronGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x8A2BE2});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

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
console.log(cube.position.x);

// 1. CALCULAR VELOCIDAD (Si presiona Shift, corre al doble de velocidad)
let currentSpeed = 0.05;
if (keys.shift) {
currentSpeed = 0.12; // Velocidad de Sprint
}

// --- MECÁNICA DE MOVIMIENTO ---

if (keys.w) cube.rotation.z += currentSpeed; // Arriba
if (keys.s) cube.rotation.z -= currentSpeed; // Abajo
if (keys.a) cube.rotation.x -= currentSpeed; // Izquierda
if (keys.d) cube.rotation.x += currentSpeed; // Derecha

if (keys.b) cube.position.y += currentSpeed; // Arriba
if (keys.v) cube.position.y -= currentSpeed; // Abajo
if (keys.n) cube.position.x -= currentSpeed; // Izquierda
if (keys.m) cube.position.x += currentSpeed; // Derecha

// --- LIMITAR LA POSICIÓN (Lógica de colisión con el borde) ---
// Límite Derecha (X positivo)
if (cube.position.x > 5) {
cube.position.x = 5;
}
// Límite Izquierda (X negativo)
else if (cube.position.x < -5) {
cube.position.x = -5;
}

// Límite Arriba (Y positivo)
if (cube.position.y > 3) {
cube.position.y = 3;
}
// Límite Abajo (Y negativo)
else if (cube.position.y < -3) {
cube.position.y = -3;
}

// Mantener una leve rotación para que se siga viendo en 3D
//cube.rotation.x += 0.005;
//cube.rotation.y += 0.005;

renderer.render(scene, camera);
}

animate();

// 6. AJUSTE DE PANTALLA (Hacer el juego responsivo)
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