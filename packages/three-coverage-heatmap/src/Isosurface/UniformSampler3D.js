import * as THREE from "three";
import HeatmapTextureMaterial from "../Material/HeatmapTextureMaterial";

export default class UniformSampler3D {
  constructor(samplesY, samplesXZ, scale) {
    this._samplesXZ = samplesXZ;
    this._texturesPerAxis = Math.ceil(Math.sqrt(samplesY));
    const offset = [-scale[0] / 2, 0, -scale[2] / 2];
    this._renderMesh = this._createRenderMesh(samplesY, scale, offset);
    this._points = this._createVisulizePoints(
      samplesY,
      samplesXZ,
      scale,
      offset
    );

    const resolution = this._texturesPerAxis * samplesXZ;
    this._renderTarget = new THREE.WebGLRenderTarget(resolution, resolution);

    this.object = new THREE.Group();
    this.object.add(this._points);
  }

  _createVisulizePoints(samplesY, samplesXZ, scale, offset) {
    const geometry = new THREE.BufferGeometry();

    const vertices = ((size, scale, offset) =>
      new Array(size[1])
        .fill(0)
        .flatMap((_, y) =>
          new Array(size[2] * size[0])
            .fill(0)
            .map((_, index) => [
              index % size[0],
              y,
              Math.floor(index / size[0]),
            ])
        )
        .map((data) => data.map((value, index) => value / size[index]))
        .map((data) =>
          data.map((v, index) => v * scale[index] + offset[index])
        ))([samplesXZ, samplesY, samplesXZ], scale, offset);

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(vertices.flat()), 3)
    );
    const material = new THREE.PointsMaterial({ vertexColors: true });
    material.size = 0.1;
    const points = new THREE.Points(geometry, material);

    return points;
  }

  _createRenderMesh(samplesY, scale, offset) {
    const coords = new Array(samplesY).fill(0).map((_, index) => {
      const y = index / samplesY;
      return [
        [1, y, 1],
        [0, y, 1],
        [1, y, 0],
        [1, y, 0],
        [0, y, 1],
        [0, y, 0],
        [1, y, 1],
        [1, y, 0],
        [0, y, 1],
        [1, y, 0],
        [0, y, 0],
        [0, y, 1],
      ];
    });

    const vertices = coords
      .flat()
      .flatMap((data) =>
        data.map((v, index) => v * scale[index] + offset[index])
      );

    const texturesPerRow = Math.ceil(Math.sqrt(samplesY));
    const layerSize = 1 / texturesPerRow;
    const uvs = coords.flatMap((data, index) => {
      const xOffset = index % texturesPerRow;
      const yOffset = Math.floor(index / texturesPerRow);
      const uv = data.flatMap(([x, _, z]) => [
        x / texturesPerRow + xOffset * layerSize,
        z / texturesPerRow + yOffset * layerSize,
      ]);
      return uv;
    });

    const geometry = new THREE.BufferGeometry();
    const material = new HeatmapTextureMaterial();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(vertices), 3)
    );
    geometry.setAttribute(
      "uv",
      new THREE.BufferAttribute(new Float32Array(uvs), 2)
    );

    const mesh = new THREE.Mesh(geometry, material);
    const scene = new THREE.Scene();
    scene.add(mesh);

    return { object: scene, material };
  }

  sample(renderer) {
    renderer.setRenderTarget(this._renderTarget);
    renderer.render(this._renderMesh.object, new THREE.Camera());
    renderer.setRenderTarget(null);

    const colors = new Array(this._texturesPerAxis ** 2)
      .fill(0)
      .reduce((prev, _, index) => {
        const pixels = new Uint8Array(4 * this._samplesXZ * this._samplesXZ);
        const xOffset = (index % this._texturesPerAxis) * this._samplesXZ;
        const yOffset =
          Math.floor(index / this._texturesPerAxis) * this._samplesXZ;
        renderer.readRenderTargetPixels(
          this._renderTarget,
          xOffset,
          yOffset,
          this._samplesXZ,
          this._samplesXZ,
          pixels
        );

        return [...prev, ...pixels];
      }, []);

    this._points.geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(
        new Float32Array(colors.map((color) => color / 255)),
        4
      )
    );
    return colors;
  }

  setUniforms(data) {
    this._renderMesh.material.setUniforms(data);
  }
}
