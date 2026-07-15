import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


// CONFIGURACIÓN DE LA ESCENA 

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Cielo azul

// Neblina para el efecto de horizonte natural
scene.fog = new THREE.Fog(0x87CEEB, 20, 45);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 12); 
camera.lookAt(0, 1, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// LUCES 

const ambientLight = new THREE.AmbientLight(0xffffff, 2.0); 
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(5, 15, 5);
scene.add(dirLight);


// VARIABLES DEL JUEGO

let buenas = 0;
let malas = 0;
const velocidadObstaculo = 0.18;
const velocidadPowerUp = 0.15;

const buenasTxt = document.getElementById('buenas-txt');
const malasTxt = document.getElementById('malas-txt');


// SUELO 

const sueloGeo = new THREE.PlaneGeometry(80, 80); 
const sueloMat = new THREE.MeshStandardMaterial({ color: 0x557a2b, roughness: 0.9 }); 
const suelo = new THREE.Mesh(sueloGeo, sueloMat);
suelo.rotation.x = -Math.PI / 2; 
scene.add(suelo);

const loader = new GLTFLoader();


// JUGADOR 

let jugador = null; 

loader.load(
    '/models/mantis.glb', 
    (gltf) => {
        const contenedor = new THREE.Group();
        const modelo = gltf.scene;
        
        const box = new THREE.Box3().setFromObject(modelo);
        const center = box.getCenter(new THREE.Vector3());
        modelo.position.set(-center.x, -box.min.y, -center.z); 
        contenedor.add(modelo);
        
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const escalaDeseada = 2.0; 
        const factorEscala = escalaDeseada / maxDim;
        contenedor.scale.set(factorEscala, factorEscala, factorEscala);
        
        contenedor.position.set(0, 0, 5); 
        jugador = contenedor;
        scene.add(jugador);
    }, 
    undefined,
    (error) => console.error(error)
);


// MULTIPLES OBSTÁCULOS 

const arañas = [];
const numeroDeArañas = 3; 
let arañaModeloBase = null; 

function configurarAraña(grupoAraña) {
    grupoAraña.position.z = -25 - (Math.random() * 15); 
    grupoAraña.position.x = (Math.random() - 0.5) * 8;   
    grupoAraña.position.y = 0; 
}

loader.load(
    '/models/araña.glb', 
    (gltf) => {
        arañaModeloBase = gltf.scene;
        
        const box = new THREE.Box3().setFromObject(arañaModeloBase);
        const center = box.getCenter(new THREE.Vector3());
        arañaModeloBase.position.set(-center.x, -box.min.y, -center.z);
        
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const tamanoDeseadoAraña = 1.5; 
        const factorEscalaAraña = tamanoDeseadoAraña / maxDim;
        arañaModeloBase.scale.set(factorEscalaAraña, factorEscalaAraña, factorEscalaAraña);

        for (let i = 0; i < numeroDeArañas; i++) {
            const nuevaArañaGrupo = new THREE.Group();
            const clonModelo = arañaModeloBase.clone();
            
            nuevaArañaGrupo.add(clonModelo);
            configurarAraña(nuevaArañaGrupo);
            
            scene.add(nuevaArañaGrupo);
            arañas.push({ grupo: nuevaArañaGrupo, modeloInterno: clonModelo });
        }
    },
    undefined,
    (error) => console.error(error)
);


// POWER-UP MODELO

const hojas = [];
const numeroDeHojas = 3; // <-- ¡Ajusta aquí cuántas hojas quieres en pantalla!
let hojaModeloBase = null;

function configurarHoja(grupoHoja) {
    grupoHoja.position.z = -30 - (Math.random() * 25); 
    grupoHoja.position.x = (Math.random() - 0.5) * 8; 
    grupoHoja.position.y = 0; 
}

loader.load(
    '/models/hoja.glb', 
    (gltf) => {
        hojaModeloBase = gltf.scene;
        
        hojaModeloBase.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(hojaModeloBase);
        const center = box.getCenter(new THREE.Vector3());
        
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const tamanoDeseadoHoja = 1.0; 
        const factorEscalaHoja = tamanoDeseadoHoja / maxDim;
        
        hojaModeloBase.scale.set(factorEscalaHoja, factorEscalaHoja, factorEscalaHoja);
        
        const boxEscalada = new THREE.Box3().setFromObject(hojaModeloBase);
        const centroEscalado = boxEscalada.getCenter(new THREE.Vector3());
        
        hojaModeloBase.position.x = -centroEscalado.x;
        hojaModeloBase.position.z = -centroEscalado.z;
        hojaModeloBase.position.y = -boxEscalada.min.y; 

        for (let i = 0; i < numeroDeHojas; i++) {
            const nuevaHojaGrupo = new THREE.Group();
            const clonModelo = hojaModeloBase.clone();
            
            nuevaHojaGrupo.add(clonModelo);
            configurarHoja(nuevaHojaGrupo);
            
            scene.add(nuevaHojaGrupo);
            hojas.push({ grupo: nuevaHojaGrupo, modeloInterno: clonModelo });
        }
    },
    undefined,
    (error) => console.error(error)
);


// CONTROLES DE TECLADO

const teclas = { Left: false, Right: false };

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') teclas.Left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') teclas.Right = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') teclas.Left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') teclas.Right = false;
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// BUCLE DE ANIMACIÓN

function animate() {
    requestAnimationFrame(animate);

    if (!jugador) return;

    // Movimiento del Jugador (Mantis)
    if (teclas.Left && jugador.position.x > -4) jugador.position.x -= 0.15;
    if (teclas.Right && jugador.position.x < 4) jugador.position.x += 0.15;

    const posicionMantisGlobal = new THREE.Vector3();
    jugador.getWorldPosition(posicionMantisGlobal);

   
    //  ARAÑAS (Obstáculos)
    
    arañas.forEach((araña) => {
        araña.grupo.position.z += velocidadObstaculo;
        
        // CORRECCIÓN ROTACIÓN: Rotar el grupo en el plano para evitar distorsiones
        araña.grupo.lookAt(posicionMantisGlobal.x, araña.grupo.position.y, posicionMantisGlobal.z);

        // CORRECCIÓN COLISIÓN: Cálculo de distancia plana (XZ) para ignorar desfases del eje Y
        const dx = jugador.position.x - araña.grupo.position.x;
        const dz = jugador.position.z - araña.grupo.position.z;
        const distanciaXZ = Math.sqrt(dx * dx + dz * dz);

        // Umbral de 1.15 metros (ajustar si es necesario)
        if (distanciaXZ < 1.15) { 
            malas++;
            if (malasTxt) malasTxt.innerText = malas;
            configurarAraña(araña.grupo);
        }

        if (araña.grupo.position.z > jugador.position.z + 2) {
            buenas++;
            if (buenasTxt) buenasTxt.innerText = buenas;
            configurarAraña(araña.grupo);
        }
    });

    if (arañas.length > 0) {
        let masCercana = arañas[0].grupo;
        arañas.forEach(a => {
            if (a.grupo.position.z < jugador.position.z && a.grupo.position.z > masCercana.position.z) {
                masCercana = a.grupo;
            }
        });
        const objetivoMantis = new THREE.Vector3(masCercana.position.x, jugador.position.y, masCercana.position.z);
        jugador.lookAt(objetivoMantis);
    }

   
    // Power-Ups)

    hojas.forEach((hoja) => {
        hoja.grupo.position.z += velocidadPowerUp;
        
        // Rotación plana sobre el eje Y estilo moneda en el piso
        hoja.modeloInterno.rotation.y += 0.02;

        // CORRECCIÓN COLISIÓN: Distancia plana XZ para colisiones limpias
        const dx = jugador.position.x - hoja.grupo.position.x;
        const dz = jugador.position.z - hoja.grupo.position.z;
        const distanciaXZ = Math.sqrt(dx * dx + dz * dz);

        if (distanciaXZ < 1.1) { 
            if (malas > 0) {
                malas--;
                if (malasTxt) malasTxt.innerText = malas;
            }
            configurarHoja(hoja.grupo);
        }

        if (hoja.grupo.position.z > jugador.position.z + 2) {
            configurarHoja(hoja.grupo);
        }
    });

    renderer.render(scene, camera);
}

animate();