import App from "./App";
import { wallsAABBs, furnitureAABBs, getPlanes } from "./data";

export default {
  title: "Example/App",
  component: App,
  parameters: {
    layout: "fullscreen",
  },
};

export const Demo = {
  args: {
    texture: "./floorplan.png",
    isSignalIndex: false,
    signalIntensity: [10, 10],
    signals: [
      [0, 1.1, -4],
      [0, 2.0, 8.1],
    ],
    aabbs: [...wallsAABBs, ...furnitureAABBs],
    planes: getPlanes(0.5),
  },
};
