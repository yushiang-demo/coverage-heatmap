import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createHeatmapMaterial } from "./heatmapMaterial";

function expandAABB(aabb, scale) {
  // Extracting min and max coordinates
  const [min, max] = aabb;

  // Center of AABB
  const center = [
    (min[0] + max[0]) / 2,
    (min[1] + max[1]) / 2,
    (min[2] + max[2]) / 2,
  ];

  // Calculate half extents
  const halfExtents = [
    (max[0] - min[0]) / 2,
    (max[1] - min[1]) / 2,
    (max[2] - min[2]) / 2,
  ];

  // Scale the half extents
  const scaledHalfExtents = halfExtents.map((extent) => extent * scale);

  // Calculate new min and max coordinates
  const newMin = [
    center[0] - scaledHalfExtents[0],
    center[1] - scaledHalfExtents[1],
    center[2] - scaledHalfExtents[2],
  ];
  const newMax = [
    center[0] + scaledHalfExtents[0],
    center[1] + scaledHalfExtents[1],
    center[2] + scaledHalfExtents[2],
  ];

  return [newMin, newMax];
}

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

    const aps = [
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
    const walls = wallData.map((aabb) => {
      const [min, max] = expandAABB(aabb, 1 + 1e-2);
      const width = max[0] - min[0];
      const height = max[1] - min[1];
      const depth = max[2] - min[2];

      const boxGeometry = new THREE.BoxGeometry(width, height, depth);
      const boxMesh = new THREE.Mesh(boxGeometry, obstacleMaterial);
      boxMesh.position.set(
        (max[0] + min[0]) / 2,
        (max[1] + min[1]) / 2,
        (max[2] + min[2]) / 2
      );
      scene.add(boxMesh);
    });

    const vertexVectors = [
      new THREE.Vector3(2, 0.0, 7),
      new THREE.Vector3(7, 0.0, 2),
      new THREE.Vector3(7, 3.0, 2),
      new THREE.Vector3(2, 3.0, 7),
      new THREE.Vector3(2, 0.0, 7),
      new THREE.Vector3(7, 3.0, 2),
    ];
    const trianglesGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(
      vertexVectors.flatMap((vec) => vec.toArray())
    );
    trianglesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(vertices, 3)
    );
    trianglesGeometry.computeVertexNormals();
    const mesh = new THREE.Mesh(trianglesGeometry, obstacleMaterial);
    scene.add(mesh);

    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    setHeatmapUniforms({
      triangleCount: vertexVectors.length / 3,
      wallCount: walls.length,
      apCount: aps.length,
      aps: aps.map((ap) => ap.position),
      walls: wallData.flatMap(([min, max]) => [
        new THREE.Vector3().fromArray(min),
        new THREE.Vector3().fromArray(max),
      ]),
      triangles: vertexVectors,
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
