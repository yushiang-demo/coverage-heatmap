export const wallsAABBs = [
  [
    [1.02, 0, -10],
    [1.45, 3, 1.2],
  ],
  [
    [-4.6, 0, 0.73],
    [1.02, 3, 1.2],
  ],
  [
    [-9.55, 0, 0.73],
    [-7.1, 3, 1.2],
  ],
  [
    [3.85, 0, -10],
    [4.25, 3, -4],
  ],
  [
    [3.85, 0, -0.6],
    [4.25, 3, 0.55],
  ],
  [
    [4.25, 0, 0.12],
    [8.34, 3, 0.55],
  ],
  [
    [-9.65, 0, 8.2],
    [-6.8, 3, 8.7],
  ],
  [
    [-3.75, 0, 8.2],
    [2.5, 3, 8.7],
  ],
  [
    [5.55, 0, 8.2],
    [8.34, 3, 8.7],
  ],
  [
    [1.02, 3, -10],
    [-9.65, 0, -9.55],
  ],
  [
    [8.34, 3, -10],
    [4.25, 0, -9.55],
  ],
  [
    [-10.0, 3, 8.7],
    [-9.55, 0, -10],
  ],
  [
    [8.34, 0, -10],
    [8.75, 3, 8.7],
  ],
];

export const furnitureAABBs = [
  [
    // sofa seat
    [-5.1, 0, 2.2],
    [-3.1, 0.3, 7.35],
  ],
  [
    // sofa back
    [-3.1, 0, 2.2],
    [-2.5, 1.0, 7.35],
  ],
  [
    // table
    [1.45, 0.8, 2.5],
    [4, 1.0, 5.2],
  ],
  [
    // bed
    [-2.1, 1.0, -9.55],
    [-8.4, 0, -3.5],
  ],
  [
    //cabinet
    [1.02, 1.0, -9.55],
    [-0.75, 0, -2.9],
  ],
];

export const getPlanes = (percentage) => {
  const MAX_ANGLE = 0;
  const MIN_ANGLE = -Math.PI / 2 + 1e-1;

  const MAX_LENGTH = -1.7;
  const MIN_LENGTH = 0;

  return [
    [
      [-7.1, 3, 0.73],
      [
        -7.1 +
          2.5 * Math.cos(MAX_ANGLE * percentage + MIN_ANGLE * (1 - percentage)),
        0,
        0.73 +
          2.5 * Math.sin(MAX_ANGLE * percentage + MIN_ANGLE * (1 - percentage)),
      ],
    ],
    [
      [4.05, 0, -0.6],
      [4.05, 3, -0.6 + MAX_LENGTH * percentage + MIN_LENGTH * (1 - percentage)],
    ],
    [
      [-6.8, 0, 8.5],
      [-3.75, 3, 8.5],
    ],
    [
      [2.5, 0, 8.5],
      [5.55, 3, 8.5],
    ],
  ];
};
