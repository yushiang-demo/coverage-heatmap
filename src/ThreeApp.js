import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createHeatmapMaterial } from "./heatmapMaterial";

function ThreeApp() {
  const { material: heatmapMaterial, setUniforms: setHeatmapUniforms } =
    createHeatmapMaterial();
  const obstacleMaterial = heatmapMaterial;
  const init = (canvas) => {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
    });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1e-3,
      1000
    );

    [
      [5, 10, 7.5],
      [-5, -10, -7.5],
    ].forEach((lightPosition) => {
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.fromArray(lightPosition);
      scene.add(directionalLight);
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 20, 100);
    controls.update();

    const geometry = new THREE.SphereGeometry(0.1, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0,
      wireframe: true,
    });

    const signals = [
      [0, 1e-3, 0],
      [5, 1e-3, 5],
    ].map((position) => {
      const accessPoint = new THREE.Mesh(geometry, material);
      accessPoint.position.fromArray(position);
      scene.add(accessPoint);
      return accessPoint;
    });

    const wallData = [
      [
        [0.5, 0, -4],
        [1, 3, 1.5],
      ],
      [
        [-5, 0, 1],
        [0.5, 3, 1.5],
      ],
    ];
    const walls = wallData.map(([min, max]) => {
      const width = max[0] - min[0];
      const height = max[1] - min[1];
      const depth = max[2] - min[2];

      const boxGeometry = new THREE.BoxGeometry(width, height, depth);
      boxGeometry.setAttribute(
        "uv",
        new THREE.BufferAttribute(new Float32Array([]), 2)
      );

      const boxMesh = new THREE.Mesh(boxGeometry, obstacleMaterial);
      boxMesh.position.set(
        (max[0] + min[0]) / 2,
        (max[1] + min[1]) / 2,
        (max[2] + min[2]) / 2
      );
      scene.add(boxMesh);
    });

    const plans = [
      [
        [1.5, 0.0, 6.5],
        [6.5, 3.0, 1.5],
      ],
      [
        [3.0, 0.0, 8.0],
        [8.0, 3.0, 3.0],
      ],
    ];
    plans.forEach(([min, max]) => {
      const vertexVectors = [
        new THREE.Vector3(min[0], min[1], min[2]),
        new THREE.Vector3(max[0], min[1], max[2]),
        new THREE.Vector3(max[0], max[1], max[2]),
        new THREE.Vector3(min[0], max[1], min[2]),
        new THREE.Vector3(min[0], min[1], min[2]),
        new THREE.Vector3(max[0], max[1], max[2]),
      ];

      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array(
        vertexVectors.flatMap((vec) => vec.toArray())
      );
      geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
      geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(geometry, obstacleMaterial);
      scene.add(mesh);
    });

    const texture = new THREE.TextureLoader().load(
      "/coverage-heatmap/public/floorplan.png"
    );

    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    setHeatmapUniforms({
      map: texture,
      planeCount: plans.length * 2,
      aabbCount: walls.length,
      signalCount: signals.length,
      signals: signals.map((ap) => ap.position),
      aabbs: wallData.flatMap(([min, max]) => [
        new THREE.Vector3().fromArray(min),
        new THREE.Vector3().fromArray(max),
      ]),
      planes: plans.flatMap(([min, max]) => [
        new THREE.Vector3().fromArray(min),
        new THREE.Vector3().fromArray(max),
      ]),
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

    const resizeCanvas = (viewportWidth, viewportHeight) => {
      canvas.width = viewportWidth;
      canvas.height = viewportHeight;
      renderer.setSize(viewportWidth, viewportHeight);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    };

    animate();

    return {
      resizeCanvas,
    };
  };

  return {
    init,
  };
}

const instance = new ThreeApp();

export default instance;
