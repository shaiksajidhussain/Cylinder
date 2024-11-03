import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const geometry = new THREE.CylinderGeometry(1, 1, 1, 30, 30, true);

// Load texture
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('./texture.png');

const material = new THREE.MeshStandardMaterial({
  map: texture,
  side: THREE.DoubleSide,
  envMapIntensity: 1 // Adjust this value to control the reflection intensity
});

const cylinder = new THREE.Mesh(geometry, material);
scene.add(cylinder);

camera.position.z = 5;

const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(canvas);

// Add lighting to see the texture
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;

camera.position.set(0, 0, 3);
controls.update();

// Create EffectComposer
const composer = new EffectComposer(renderer);

// Create RenderPass
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Create UnrealBloomPass
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.3 // strength (default value)
);
composer.addPass(bloomPass);

// Add contrast shader




// Add GUI
const gui = new GUI();
gui.add(bloomPass, 'strength', 0, 10, 1).name('Bloom Strength');
gui.add(material, 'envMapIntensity', 0, 3, 0.1).name('Env Map Intensity');

// Set up GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Wrap the canvas in a container div for easier manipulation
const canvasContainer = document.createElement('div');
canvasContainer.style.position = 'fixed';
canvasContainer.style.top = '0';
canvasContainer.style.left = '0';
canvasContainer.style.width = '100%';
canvasContainer.style.height = '100%';
document.body.appendChild(canvasContainer);
canvasContainer.appendChild(renderer.domElement);

// Create a scroll container for triggering the animation
const scrollContainer = document.createElement('div');
scrollContainer.style.height = '200vh'; // Make it twice the viewport height
document.body.appendChild(scrollContainer);

// Set up the falling and bouncing animation
gsap.set(canvasContainer, { y: '-100%' }); // Start above the viewport

gsap.to(canvasContainer, {
  y: '0%',
  ease: 'bounce.out',
  duration: 2,
  scrollTrigger: {
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
    onEnter: () => {
      // Trigger the bouncing animation when entering the viewport
      gsap.to(canvasContainer, {
        y: '0%',
        ease: 'bounce.out',
        duration: 2,
        repeat: 2, // Bounce 3 times in total
        yoyo: true,
        onComplete: () => {
          // After bouncing, set it to stay at the bottom
          gsap.set(canvasContainer, { y: '0%' });
        }
      });
    }
  }
});

function animate() {
  requestAnimationFrame(animate);
  
  cylinder.rotation.y += 0.01;
  
  controls.update();
  
  composer.render();
}

animate();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}
