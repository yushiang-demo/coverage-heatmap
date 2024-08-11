import * as THREE from "three";
import { MarchingCubes } from "three/addons/objects/MarchingCubes.js";

class IsoSurface extends MarchingCubes {
  constructor(samplesY, samplesXZ, scale) {
    const material = new THREE.MeshBasicMaterial({
      color: "red",
      side: THREE.DoubleSide,
      opacity: 0.5,
      transparent: true,
      // depthTest: false,
    });
    super(samplesXZ, material, true, true, 100000);
    this._samplesY = samplesY;
    this._samplesXZ = samplesXZ;
    this._material = material;

    this.position.set(0, scale[1] / 2, 0);
    this.scale.set(scale[0] / 2, scale[1] / 2, scale[2] / 2);
  }

  setIsoValue(value) {
    this.isolation = value * 255;

    const color = new THREE.Color();
    5;
    color.setHSL(value, 1, 0.5);
    this.material.color = color;
  }

  updateFromColors(colors) {
    this.reset();

    new Array(this._samplesXZ)
      .fill(0)
      .flatMap((_, y) =>
        new Array(this._samplesXZ ** 2)
          .fill(0)
          .map((_, xz) => [
            xz % this._samplesXZ,
            y,
            Math.floor(xz / this._samplesXZ),
          ])
      )
      .forEach(([x, y, z]) => {
        const index =
          Math.floor((y / this._samplesXZ) * this._samplesY) *
            this._samplesXZ ** 2 +
          z * this._samplesXZ +
          x;
        this.setCell(x, y, z, colors[index * 4]);
      });

    this.update();
  }
}

export default IsoSurface;
