import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import vertexShader from "./shaders/vertexShader";
import fragmentShader from "./shaders/fragmentShader";

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

  const geometry = new THREE.SphereGeometry(0.1, 16, 16);
  const material = new THREE.MeshBasicMaterial({
    color: 0,
    wireframe: true,
  });
  const accessPoint = new THREE.Mesh(geometry, material);
  accessPoint.position.set(0, 0.5, 0);
  scene.add(accessPoint);

  const wall = new THREE.Box3(
    new THREE.Vector3(0.5, 0, -0.5),
    new THREE.Vector3(1.5, 1, 1.5)
  );
  const helper = new THREE.Box3Helper(wall, 0);
  scene.add(helper);

  const floorGeometry = new THREE.BoxGeometry(10, 10, 5);
  floorGeometry.translate(3, -3, 2.5);
  const heatmapMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      aps: {
        value: [accessPoint.position],
      },
      walls: {
        value: [wall.min, wall.max],
      },
    },
    vertexShader,
    fragmentShader,
  });
  const heatmap = new THREE.Mesh(floorGeometry, heatmapMaterial);
  heatmap.rotateX(-Math.PI / 2);
  scene.add(heatmap);

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
