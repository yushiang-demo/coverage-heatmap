import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import HeatmapMaterial from "./Materials/HeatmapMaterial";

/** @class */
function ThreeCoverageHeatmap() {
  const heatmapMaterial = new HeatmapMaterial();
  const obstacleMaterial = heatmapMaterial;
  const scene = new THREE.Scene();

  const setSignal = (() => {
    const group = new THREE.Group();
    scene.add(group);
    return (data) => {
      if (!data) return;
      group.clear();
      data.forEach((position) => {
        const geometry = new THREE.SphereGeometry(0.1, 16, 16);
        const material = new THREE.MeshBasicMaterial({
          color: 0,
          wireframe: true,
        });
        const accessPoint = new THREE.Mesh(geometry, material);
        accessPoint.position.fromArray(position);
        group.add(accessPoint);
      });

      heatmapMaterial.setUniforms({
        signalCount: data.length,
        signals: data.map((arr) => new THREE.Vector3().fromArray(arr)),
      });
    };
  })();

  const setAABB = (() => {
    const group = new THREE.Group();
    scene.add(group);

    return (data) => {
      if (!data) return;
      group.clear();
      data.forEach(([min, max]) => {
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
        group.add(boxMesh);
      });

      heatmapMaterial.setUniforms({
        aabbCount: data.length,
        aabbs: data.flatMap(([min, max]) => [
          new THREE.Vector3().fromArray(min),
          new THREE.Vector3().fromArray(max),
        ]),
      });
    };
  })();

  const setPlane = (() => {
    const group = new THREE.Group();
    scene.add(group);
    return (data) => {
      if (!data) return;
      group.clear();
      data.forEach(([min, max]) => {
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
        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(vertices, 3)
        );
        geometry.computeVertexNormals();
        const mesh = new THREE.Mesh(geometry, obstacleMaterial);
        group.add(mesh);
      });

      heatmapMaterial.setUniforms({
        planeCount: data.length * 2,
        planes: data.flatMap(([min, max]) => [
          new THREE.Vector3().fromArray(min),
          new THREE.Vector3().fromArray(max),
        ]),
      });
    };
  })();

  const setIsSignalIndex = (data) => {
    heatmapMaterial.setUniforms({
      isSignalIndex: data,
    });
  };

  const setSignalIntensities = (data) => {
    heatmapMaterial.setUniforms({
      signalIntensities: data,
    });
  };

  const setTexture = (url) => {
    const texture = new THREE.TextureLoader().load(url);
    heatmapMaterial.setUniforms({
      map: texture,
    });
  };

  const init = (canvas) => {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
    });
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1e-3,
      1000
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 20, 100);
    controls.update();

    const floorGeometry = new THREE.PlaneGeometry(20, 20);

    const heatmap = new THREE.Mesh(floorGeometry, heatmapMaterial);
    heatmap.rotateX(-Math.PI / 2);
    scene.add(heatmap);

    camera.position.z = 5;

    let frameIndex = 0;
    const animate = () => {
      frameIndex = requestAnimationFrame(animate);

      controls.update();

      renderer.render(scene, camera);
    };
    const dispose = () => {
      cancelAnimationFrame(frameIndex);
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
      dispose,
    };
  };

  return {
    init,
    setSignal,
    setSignalIntensities,
    setAABB,
    setPlane,
    setIsSignalIndex,
    setTexture,
  };
}

export default ThreeCoverageHeatmap;
