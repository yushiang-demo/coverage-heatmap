import * as THREE from "three";
import HeatmapTextureMaterial from "../Material/HeatmapTextureMaterial";

class Sampler extends THREE.Mesh {
  constructor() {
    const heatmapPlanes = (() => {
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

        const textureUnit = Math.ceil(Math.sqrt(layers));
        const layerSize = 1 / textureUnit;
        const uvs = coords.flatMap((data, index) => {
          const xOffset = index % textureUnit;
          const yOffset = Math.floor(index / textureUnit);
          const uv = data.flatMap(([x, _, z]) => [
            x / textureUnit + xOffset * layerSize,
            z / textureUnit + yOffset * layerSize,
          ]);
          return uv;
        });

        return {
          vertices,
          uvs,
        };
      })(2 ** 2, [20, 3, 20], [-10, 0, -10]);

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

    const resolution = 256;
    const renderTarget = new THREE.WebGLRenderTarget(resolution, resolution);
    const geometry = new THREE.PlaneGeometry(10, 10);
    const material = new THREE.MeshBasicMaterial({ map: renderTarget.texture });

    super(geometry, material);

    this.heatmapPlanes = heatmapPlanes;
    this.geometry = geometry;
    this.material = material;
    this.resolution = resolution;
    this.renderTarget = renderTarget;
  }

  update(renderer) {
    renderer.setRenderTarget(this.renderTarget);
    renderer.render(this.heatmapPlanes.scene, new THREE.Camera());
    renderer.setRenderTarget(null);
    const read = new Uint8Array(4 * this.resolution * this.resolution);
    renderer.readRenderTargetPixels(
      this.renderTarget,
      0,
      0,
      this.resolution,
      this.resolution,
      read
    );
    console.log(read);
  }

  setUniforms(data) {
    this.heatmapPlanes.material.setUniforms(data);
  }
}

export default Sampler;
