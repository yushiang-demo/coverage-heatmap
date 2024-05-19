import React, { useEffect, useRef, useState } from "react";
import ThreeApp from "./ThreeApp";

const wallsAABBs = [
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
    [-9.65, 0, -9.55],
    [1.02, 3, -10],
  ],
  [
    [4.25, 0, -9.55],
    [8.34, 3, -10],
  ],
  [
    [-9.55, 0, -10],
    [-10.0, 3, 8.7],
  ],
  [
    [8.34, 0, -10],
    [8.75, 3, 8.7],
  ],
];

const furnitureAABBs = [
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
    [-8.4, 0, -3.5],
    [-2.1, 1.0, -9.55],
  ],
  [
    //cabinet
    [-0.75, 0, -2.9],
    [1.02, 1.0, -9.55],
  ],
];
const FullScreenCanvas = () => {
  const [isSignalIndex, setIsSignalIndex] = useState(false);
  const [hasFurniture, setHasFurniture] = useState(true);
  const [hasWall, setHasWall] = useState(true);

  const [signalIntensity, setSignalIntensity] = useState([10, 10]);
  const [signal] = useState([
    [0, 1.1, -4],
    [0, 2.0, 8.1],
  ]);
  const [aabb] = useState([...wallsAABBs, ...furnitureAABBs]);
  const [plane] = useState([
    [
      [-7.1, 3, 0.73],
      [
        -7.1 + 2.5 * Math.cos(-Math.PI / 3),
        0,
        0.73 + 2.5 * Math.sin(-Math.PI / 3),
      ],
    ],
    [
      [4.05, 0, -0.6],
      [4.05, 3, -2.3],
    ],
    [
      [-6.8, 0, 8.5],
      [-3.75, 3, 8.5],
    ],
    [
      [2.5, 0, 8.5],
      [5.55, 3, 8.5],
    ],
  ]);
  const divRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    ThreeApp.setIsSignalIndex(isSignalIndex);
  }, [isSignalIndex]);

  useEffect(() => {
    ThreeApp.setSignalIntensity(signalIntensity);
  }, [signalIntensity]);

  useEffect(() => {
    ThreeApp.setSignal(signal);
  }, [signal]);

  useEffect(() => {
    let arr = [];
    if (hasFurniture) {
      arr = [...arr, ...furnitureAABBs];
    }
    if (hasWall) {
      arr = [...arr, ...wallsAABBs];
    }
    ThreeApp.setAABB(arr);
  }, [aabb, hasFurniture, hasWall]);

  useEffect(() => {
    ThreeApp.setPlane(plane);
  }, [plane]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const { resizeCanvas, dispose } = ThreeApp.init(canvas);
    const onResize = () => {
      const viewportWidth = divRef.current.clientWidth;
      const viewportHeight = divRef.current.clientHeight;
      resizeCanvas(viewportWidth, viewportHeight);
    };
    onResize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      dispose();
    };
  }, []);

  const onIntensityChange = (index) => (e) => {
    const value = parseFloat(e.target.value);
    const copy = [...signalIntensity];
    copy[index] = value;
    setSignalIntensity(copy);
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
        }}
      >
        {signalIntensity.map((intensity, index) => {
          const id = `signal${index}_intensity`;
          return (
            <React.Fragment key={id}>
              <label htmlFor={id}>{id}</label>
              <input
                type="range"
                id={id}
                min={1e-3}
                max={30}
                step={1e-1}
                onChange={onIntensityChange(index)}
                value={intensity}
              />
              <br />
            </React.Fragment>
          );
        })}
        <input
          type="checkbox"
          id={"wall"}
          onChange={(e) => setHasWall(e.target.checked)}
          checked={hasWall}
        />
        <label htmlFor="wall">has wall</label>
        <br />
        <input
          type="checkbox"
          id={"furniture"}
          onChange={(e) => setHasFurniture(e.target.checked)}
          checked={hasFurniture}
        />
        <label htmlFor="furniture">has furniture</label>
        <br />
        <input
          type="checkbox"
          id={"signalIndex"}
          onChange={(e) => setIsSignalIndex(e.target.checked)}
          checked={isSignalIndex}
        />
        <label htmlFor="signalIndex">show signal index map</label>
        <br />
      </div>
      <div
        ref={divRef}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.1)",
        }}
      >
        <canvas ref={canvasRef} />
      </div>
    </>
  );
};

export default FullScreenCanvas;
