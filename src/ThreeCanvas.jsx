import React, { useEffect, useRef } from "react";
import ThreeApp from "./ThreeApp";
const FullScreenCanvas = () => {
  const divRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const { resizeCanvas } = ThreeApp.init(canvas);

    const onResize = () => {
      const viewportWidth = divRef.current.clientWidth;
      const viewportHeight = divRef.current.clientHeight;
      resizeCanvas(viewportWidth, viewportHeight);
    };
    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
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
