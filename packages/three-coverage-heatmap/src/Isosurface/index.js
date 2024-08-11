import * as THREE from "three";
import { MarchingCubes } from "three/addons/objects/MarchingCubes.js";

class Isosurface extends MarchingCubes {
  constructor(samplesY, samplesXZ, scale) {
    const material = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      opacity: 0.3,
      transparent: true,
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
    this.update();
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
        const isBoundary = [x, y, z].some(
          (index) => index <= 1 || index >= this._samplesXZ - 2
        );
        this.setCell(x, y, z, !isBoundary ? colors[index * 4] : 0);
      });

    this.update();
  }
}

export default Isosurface;
