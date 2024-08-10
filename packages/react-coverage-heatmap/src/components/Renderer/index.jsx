import React, { useEffect, useRef, useState } from "react";
import ThreeCoverageHeatmap from "three-coverage-heatmap";

const Renderer = ({
  texture,
  textCoordScale,
  textCoordSoffset,
  isSignalIndex,
  signalIntensities,
  signals,
  aabbs,
  planes,
}) => {
  const [ThreeApp] = useState(new ThreeCoverageHeatmap());
  const divRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    ThreeApp.setTexture(undefined, textCoordScale, textCoordSoffset);
  }, [textCoordScale, textCoordSoffset]);

  useEffect(() => {
    ThreeApp.setTexture(texture);
  }, [texture]);

  useEffect(() => {
    ThreeApp.setIsSignalIndex(isSignalIndex);
  }, [isSignalIndex]);

  useEffect(() => {
    ThreeApp.setSignalIntensities(signalIntensities);
  }, [signalIntensities]);

  useEffect(() => {
    ThreeApp.setSignal(signals);
  }, [signals]);

  useEffect(() => {
    ThreeApp.setAABB(aabbs);
  }, [aabbs]);

  useEffect(() => {
    ThreeApp.setPlane(planes);
  }, [planes]);

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
        overflow: "hidden",
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Renderer;
