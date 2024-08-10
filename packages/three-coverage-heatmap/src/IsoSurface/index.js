import * as THREE from "three";
import HeatmapTextureMaterial from "../Material/HeatmapTextureMaterial";
import { MarchingCubes } from "three/addons/objects/MarchingCubes.js";

const LAYER_COUNT = 3 ** 2;
const TEXTURE_ALTAS_SIZE = Math.ceil(Math.sqrt(LAYER_COUNT));
const SAMPLES_PER_AXIS = 50;
const SAMPLES_SCALE = [20, 3, 20];
const SAMPLES_OFFSET = [-10, 0, -10];

class IsoSurface extends THREE.Points {
  constructor() {
    const sampler = (() => {
      const geometry = new THREE.BufferGeometry();
      const material = new HeatmapTextureMaterial();
      const { vertices, uvs } = ((layers, scale, offset) => {
        const coords = new Array(layers).fill(0).map((_, index) => {
          const y = index / layers;
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

        const layerSize = 1 / TEXTURE_ALTAS_SIZE;
        const uvs = coords.flatMap((data, index) => {
          const xOffset = index % TEXTURE_ALTAS_SIZE;
          const yOffset = Math.floor(index / TEXTURE_ALTAS_SIZE);
          const uv = data.flatMap(([x, _, z]) => [
            x / TEXTURE_ALTAS_SIZE + xOffset * layerSize,
            z / TEXTURE_ALTAS_SIZE + yOffset * layerSize,
          ]);
          return uv;
        });

        return {
          vertices,
          uvs,
        };
      })(LAYER_COUNT, SAMPLES_SCALE, SAMPLES_OFFSET);

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

      return { scene, material };
    })();

    const resolution = TEXTURE_ALTAS_SIZE * SAMPLES_PER_AXIS;
    const renderTarget = new THREE.WebGLRenderTarget(resolution, resolution);
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
        ))(
      [SAMPLES_PER_AXIS, LAYER_COUNT, SAMPLES_PER_AXIS],
      SAMPLES_SCALE,
      SAMPLES_OFFSET
    );
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(vertices.flat()), 3)
    );
    const material = new THREE.PointsMaterial({ vertexColors: true });
    material.size = 0.1;
    super(geometry, material);

    this.sampler = sampler;
    this.geometry = geometry;
    this.material = material;
    this.resolution = resolution;
    this.renderTarget = renderTarget;

    const isoSurface = new MarchingCubes(
      SAMPLES_PER_AXIS,
      new THREE.MeshBasicMaterial({
        color: "red",
        side: THREE.BackSide,
        opacity: 0.5,
        transparent: true,
      }),
      true,
      true,
      100000
    );
    isoSurface.position.set(0, SAMPLES_SCALE[1] / 2, 0);
    isoSurface.scale.set(
      SAMPLES_SCALE[0] / 2,
      SAMPLES_SCALE[1] / 2,
      SAMPLES_SCALE[2] / 2
    );
    isoSurface.isolation = 175;
    this.add(isoSurface);
    this.isoSurface = isoSurface;
  }

  update(renderer) {
    renderer.setRenderTarget(this.renderTarget);
    renderer.render(this.sampler.scene, new THREE.Camera());
    renderer.setRenderTarget(null);
    const colors = new Array(TEXTURE_ALTAS_SIZE ** 2)
      .fill(0)
      .reduce((prev, _, index) => {
        const pixels = new Uint8Array(4 * SAMPLES_PER_AXIS * SAMPLES_PER_AXIS);
        const xOffset = (index % TEXTURE_ALTAS_SIZE) * SAMPLES_PER_AXIS;
        const yOffset =
          Math.floor(index / TEXTURE_ALTAS_SIZE) * SAMPLES_PER_AXIS;
        renderer.readRenderTargetPixels(
          this.renderTarget,
          xOffset,
          yOffset,
          SAMPLES_PER_AXIS,
          SAMPLES_PER_AXIS,
          pixels
        );

        return [...prev, ...pixels];
      }, []);

    this.isoSurface.reset();

    const self = this;
    new Array(SAMPLES_PER_AXIS)
      .fill(0)
      .flatMap((_, y) =>
        new Array(SAMPLES_PER_AXIS ** 2)
          .fill(0)
          .map((_, index) => [
            index % SAMPLES_PER_AXIS,
            y,
            Math.floor(index / SAMPLES_PER_AXIS),
          ])
      )
      .forEach(([x, y, z]) => {
        const index =
          Math.floor((y / SAMPLES_PER_AXIS) * LAYER_COUNT) *
            SAMPLES_PER_AXIS ** 2 +
          z * SAMPLES_PER_AXIS +
          x;
        self.isoSurface.setCell(x, y, z, colors[index * 4]);
      });

    this.isoSurface.update();

    this.geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(
        new Float32Array(colors.map((color) => color / 255)),
        4
      )
    );
  }

  setUniforms(data) {
    this.sampler.material.setUniforms(data);
  }
}

export default IsoSurface;
