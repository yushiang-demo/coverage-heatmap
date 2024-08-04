import * as THREE from "three";
import HeatmapMaterial from "../Material/HeatmapMaterial";

class Sampler extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.BufferGeometry();
    const material = new HeatmapMaterial();
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
    })(9, [20, 3, 20], [-10, 0, -10]);

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(vertices), 3)
    );
    geometry.setAttribute(
      "uv",
      new THREE.BufferAttribute(new Float32Array(uvs), 2)
    );

    super(geometry, material);
  }

  setUniforms(data) {
    this.material.setUniforms(data);
  }
}

export default Sampler;
