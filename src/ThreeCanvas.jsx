import React, { useEffect, useRef } from "react";
import ThreeApp from "./ThreeApp";
const FullScreenCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const core = new ThreeApp(canvas);

    window.addEventListener("resize", core.resizeCanvas);

    return () => {
      window.removeEventListener("resize", core.resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
};

export default FullScreenCanvas;
