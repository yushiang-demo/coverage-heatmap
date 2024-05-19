import React, { useEffect, useRef } from "react";
import ThreeApp from "./ThreeApp";
const FullScreenCanvas = () => {
  const divRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const { resizeCanvas, dispose } = ThreeApp.init(canvas);

    ThreeApp.setSignal([
      [0, 1e-3, 0],
      [5, 1e-3, 5],
    ]);

    ThreeApp.setAABB([
      [
        [0.5, 0, -4],
        [1, 3, 1.5],
      ],
      [
        [-5, 0, 1],
        [0.5, 3, 1.5],
      ],
    ]);

    ThreeApp.setPlane([
      [
        [1.5, 0.0, 6.5],
        [6.5, 3.0, 1.5],
      ],
      [
        [3.0, 0.0, 8.0],
        [8.0, 3.0, 3.0],
      ],
    ]);

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
