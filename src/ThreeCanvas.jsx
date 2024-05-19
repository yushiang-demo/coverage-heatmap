import React, { useEffect, useRef, useState } from "react";
import ThreeApp from "./ThreeApp";
const FullScreenCanvas = () => {
  const [signal] = useState([
    [0, 1.1, -4],
    [0, 2.0, 8.1],
  ]);
  const [aabb] = useState([
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
  ]);
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
    ThreeApp.setSignal(signal);
  }, [signal]);

  useEffect(() => {
    ThreeApp.setAABB(aabb);
  }, [aabb]);

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

  return (
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
  );
};

export default FullScreenCanvas;
