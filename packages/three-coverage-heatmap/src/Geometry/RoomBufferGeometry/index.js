import * as THREE from "three";

/**
 * Represents a room with control over its features like walls, doors, furniture and signals.
 * @class
 * @extends THREE.BufferGeometry
 */
class RoomBufferGeometry extends THREE.BufferGeometry {
  constructor() {
    super();
    this.aabbArray = [];
    this.PLANE_THICKNESS = 8e-2;
    this.planeArray = [];
    this.floorVertices = [];
  }

  _updateGeometry() {
    const aabbVertices = this.aabbArray.flatMap(([min, max]) => {
      const width = max[0] - min[0];
      const height = max[1] - min[1];
      const depth = max[2] - min[2];

      const aabbGeometry = new THREE.BoxGeometry(width, height, depth);
      aabbGeometry.translate(
        (max[0] + min[0]) / 2,
        (max[1] + min[1]) / 2,
        (max[2] + min[2]) / 2
      );

      const vertices = [...aabbGeometry.attributes.position.array];
      const index = [...aabbGeometry.getIndex().array];
      const data = index.flatMap((index) => [
        vertices[index * 3],
        vertices[index * 3 + 1],
        vertices[index * 3 + 2],
      ]);
      return data;
    });
    const planeVertices = this.planeArray.flatMap(([min, max]) => {
      const rotationMat = new THREE.Matrix4().lookAt(
        new THREE.Vector3(min[0], 0, min[2]),
        new THREE.Vector3(max[0], 0, max[2]),
        new THREE.Vector3(0, 1, 0)
      );
      const quaternion = new THREE.Quaternion().setFromRotationMatrix(
        rotationMat
      );

      const depth = new THREE.Vector2(
        max[0] - min[0],
        max[2] - min[2]
      ).length();
      const height = max[1] - min[1];

      const aabbGeometry = new THREE.BoxGeometry(
        this.PLANE_THICKNESS,
        height,
        depth
      );
      aabbGeometry.applyQuaternion(quaternion);
      aabbGeometry.translate(
        (max[0] + min[0]) / 2,
        (max[1] + min[1]) / 2,
        (max[2] + min[2]) / 2
      );

      const vertices = [...aabbGeometry.attributes.position.array];
      const index = [...aabbGeometry.getIndex().array];
      const data = index.flatMap((index) => [
        vertices[index * 3],
        vertices[index * 3 + 1],
        vertices[index * 3 + 2],
      ]);
      return data;
    });

    this.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array([
          ...this.floorVertices.flat(),
          ...aabbVertices,
          ...planeVertices,
        ]),
        3
      )
    );
  }

  /**
   * Sets the floor size.
   * @param {number} width The width of the room.
   * @param {number} length The length of the room.
   * @example
   * roomBufferGeometry.setFloor(20, 20);
   */
  setFloor(width, length) {
    this.floorVertices = [
      [1, 0, 1],
      [-1, 0, 1],
      [1, 0, -1],
      [1, 0, -1],
      [-1, 0, 1],
      [-1, 0, -1],
      [1, 0, 1],
      [1, 0, -1],
      [-1, 0, 1],
      [1, 0, -1],
      [-1, 0, -1],
      [-1, 0, 1],
    ].flatMap(([x, y, z]) => [(x * width) / 2, y, (z * length) / 2]);
    this._updateGeometry();
  }

  /**
   * Sets the Axis-Aligned Bounding Box (AABB) data.
   * @param {Array<Vector.Vector3Pair>} data An array containing two elements, each representing a start and end vector, both three-dimensional.
   * @example
   * roomBufferGeometry.setAABB([
   *   [[0, 0, 0], [1, 1, 1]]
   * ]);
   */
  setAABB(data) {
    if (!data) return;
    this.aabbArray = data;
    this._updateGeometry();
  }

  /**
   * Sets the plane data.
   * @param {Array<Vector.Vector3Pair>} data An array containing two elements, each representing a start and end vector, both three-dimensional.
   * @example
   * roomBufferGeometry.setPlane([
   *   [[0, 0, 0], [1, 1, 1]]
   * ]);
   */
  setPlane(data) {
    if (!data) return;
    this.planeArray = data;
    this._updateGeometry();
  }
}

export default RoomBufferGeometry;
