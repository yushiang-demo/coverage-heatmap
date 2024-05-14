import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function ThreeApp(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

  const controls = new OrbitControls(camera, renderer.domElement);
  camera.position.set(0, 20, 100);
  controls.update();

  const gridHelper = new THREE.GridHelper(20, 20);
  scene.add(gridHelper);

  camera.position.z = 5;

  const animate = () => {
    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);
  };

  const resizeCanvas = () => {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    canvas.width = viewportWidth;
    canvas.height = viewportHeight;
    renderer.setSize(viewportWidth, viewportHeight);
    camera.aspect = viewportWidth / viewportHeight;
    camera.updateProjectionMatrix();
  };

  resizeCanvas(animate());

  return {
    resizeCanvas,
  };
}

export default ThreeApp;
