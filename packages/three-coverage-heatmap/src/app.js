import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import HeatmapMaterial from "./Material/HeatmapMaterial";
import RoomBufferGeometry from "./Geometry/RoomBufferGeometry";
import IsoSurface from "./IsoSurface";

/** @class */
class App {
  constructor() {
    this._renderer = null;
    this._scene = new THREE.Scene();

    this.heatmapMaterial = new HeatmapMaterial();
    this.roomGeometry = new RoomBufferGeometry();
    this.roomGeometry.setFloor(20, 20);
    const room = new THREE.Mesh(this.roomGeometry, this.heatmapMaterial);
    this._scene.add(room);

    this.isoSurface = new IsoSurface();
    this._scene.add(this.isoSurface);

    this._signalGroup = new THREE.Group();
    this._scene.add(this._signalGroup);
  }

  _updateConfig(data) {
    this.heatmapMaterial.setUniforms(data);
    this.isoSurface.setUniforms(data);
    if (this._renderer) this.isoSurface.update(this._renderer);
  }

  /**
   * Sets a signal at specific positions in a 3D dimension.
   * @param {Array<Vector.Vector3>} data An array containing vectors representing positions in 3D space where signals are set.
   * @example
   * app.setSignal([
   *   [0, 0, 0],
   *   [1, 1, 1]
   * ]);
   */
  setSignal(data) {
    if (!data) return;
    this._signalGroup.clear();
    data.forEach((position) => {
      const geometry = new THREE.SphereGeometry(0.1, 16, 16);
      const material = new THREE.MeshBasicMaterial({
        color: 0,
        wireframe: true,
      });
      const accessPoint = new THREE.Mesh(geometry, material);
      accessPoint.position.fromArray(position);
      this._signalGroup.add(accessPoint);
    });

    this._updateConfig({
      signalCount: data.length,
      signals: data.map((arr) => new THREE.Vector3().fromArray(arr)),
    });
  }

  /**
   * Sets the Axis-Aligned Bounding Box (AABB) data.
   * @param {Array<Vector.Vector3Pair>} data An array containing two elements, each representing a start and end vector, both three-dimensional.
   * @example
   * app.setAABB([
   *   [[0, 0, 0], [1, 1, 1]]
   * ]);
   */
  setAABB(data) {
    if (!data) return;
    this.roomGeometry.setAABB(data);
    this._updateConfig({
      aabbCount: data.length,
      aabbs: data.flatMap(([min, max]) => [
        new THREE.Vector3().fromArray(min),
        new THREE.Vector3().fromArray(max),
      ]),
    });
  }

  /**
   * Sets the plane data.
   * @param {Array<Vector.Vector3Pair>} data An array containing two elements, each representing a start and end vector, both three-dimensional.
   * @example
   * app.setPlane([
   *   [[0, 0, 0], [1, 1, 1]]
   * ]);
   */
  setPlane(data) {
    if (!data) return;
    this.roomGeometry.setPlane(data);
    this._updateConfig({
      planeCount: data.length * 2,
      planes: data.flatMap(([min, max]) => [
        new THREE.Vector3().fromArray(min),
        new THREE.Vector3().fromArray(max),
      ]),
    });
  }

  /**
   * Sets whether to show the indexMap or not.
   * @param {boolean} data A boolean value indicating whether to show the indexMap.
   * @example
   * app.setIsSignalIndex(true);
   */
  setIsSignalIndex(data) {
    this._updateConfig({
      isSignalIndex: data,
    });
  }

  /**
   * Sets the intensity for each signal.
   * @param {Array<number>} data An array containing intensity values for each signal.
   * @example
   * app.setSignalIntensities([0.2, 0.5, 0.8]);
   */
  setSignalIntensities(data) {
    this._updateConfig({
      signalIntensities: data,
    });
  }

  /**
   * Sets the floorplan used as a texture.
   * @param {string} url The URL of the floorplan image.
   * @param {Array<number>} scale - The scale factors to apply to the sampling coordinates.
   * @param {Array<number>} offset - The offsets for positioning the sampling coordinates.
   * @example
   * app.setTexture("https://example.com/floorplan.jpg", [1, 1], [0, 0]);
   */
  setTexture(url, scale, offset) {
    if (url) {
      const texture = new THREE.TextureLoader().load(url);
      this._updateConfig({
        map: texture,
      });
    }

    if (scale && offset)
      this._updateConfig({
        mapScale: new THREE.Vector2().fromArray(scale),
        mapOffset: new THREE.Vector2().fromArray(offset),
      });
  }

  /**
   * Initializes Three.js rendering on a given canvas element.
   * @param {HTMLCanvasElement} canvas The canvas element to bind Three.js rendering.
   * @returns {Object} An object containing two callbacks:
   * - resizeCanvas: A callback to resize the renderer when the size of the canvas changes.
   * - dispose: A callback to clear the rendering process if the canvas element is removed from the DOM.
   * @example
   * const canvasElement = document.getElementById('myCanvas');
   * const {resizeCanvas, dispose} = app.init(canvasElement);
   */
  init(canvas) {
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

    camera.position.z = 5;

    let frameIndex = 0;
    const animate = () => {
      frameIndex = requestAnimationFrame(animate);

      controls.update();

      renderer.render(this._scene, camera);
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

    this._renderer = renderer;

    return {
      resizeCanvas,
      dispose,
    };
  }
}

export default App;
