import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import vertexShader from "./shaders/vertexShader";
import getFragmentShader from "./shaders/fragmentShader";

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

  const aps = [
    [0, 1e-3, 0],
    [5, 1e-3, 5],
  ].map((position) => {
    const accessPoint = new THREE.Mesh(geometry, material);
    accessPoint.position.fromArray(position);
    scene.add(accessPoint);
    return accessPoint;
  });

  const walls = [
    [
      [0.5, 0, -4],
      [1, 3, 1.5],
    ],
    [
      [-5, 0, 1],
      [0.5, 3, 1.5],
    ],
  ].map(([min, max]) => {
    const wall = new THREE.Box3(
      new THREE.Vector3().fromArray(min),
      new THREE.Vector3().fromArray(max)
    );
    const helper = new THREE.Box3Helper(wall, 0);
    scene.add(helper);
    return wall;
  });

  const floorGeometry = new THREE.BoxGeometry(20, 20, 3);
  floorGeometry.translate(0, 0, 1.5);
  const heatmapMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      wallCount: {
        value: walls.length,
      },
      apCount: {
        value: aps.length,
      },
      aps: {
        value: aps.map((ap) => ap.position),
      },
      walls: {
        value: walls.flatMap((wall) => [wall.min, wall.max]),
      },
    },
    vertexShader,
    fragmentShader: getFragmentShader(aps.length, walls.length),
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
