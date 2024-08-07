import Renderer from "./Renderer";
import { wallsAABBs, furnitureAABBs, getPlanes } from "./data";

export default {
  title: "react-coverage-heatmap/Renderer",
  tags: ["autodocs"],
  component: Renderer,
  parameters: {
    layout: "fullscreen",
  },
};

export const ShowroomFloorAp = {
  args: {
    texture: "./floorplan.png",
    textCoordScale: [1 / 20, 1 / 20],
    textCoordSoffset: [0.5, 0.5],
    isSignalIndex: false,
    signalIntensities: [10],
    signals: [[0, 1e-3, 8.1]],
    aabbs: [...wallsAABBs, ...furnitureAABBs],
    planes: getPlanes(0.8),
  },
};

export const ShowroomCeilingAp = {
  args: {
    texture: "./floorplan.png",
    textCoordScale: [1 / 20, 1 / 20],
    textCoordSoffset: [0.5, 0.5],
    isSignalIndex: false,
    signalIntensities: [10],
    signals: [[0, 2.0, 8.1]],
    aabbs: [...wallsAABBs, ...furnitureAABBs],
    planes: getPlanes(0.8),
  },
};

export const ShowroomTwoAps = {
  args: {
    texture: "./floorplan.png",
    textCoordScale: [1 / 20, 1 / 20],
    textCoordSoffset: [0.5, 0.5],
    isSignalIndex: false,
    signalIntensities: [10, 10],
    signals: [
      [0, 1.1, -4],
      [0, 2.0, 8.1],
    ],
    aabbs: [...wallsAABBs, ...furnitureAABBs],
    planes: getPlanes(0.8),
  },
};

export const ShowroomIndexMap = {
  args: {
    texture: "./floorplan.png",
    textCoordScale: [1 / 20, 1 / 20],
    textCoordSoffset: [0.5, 0.5],
    isSignalIndex: true,
    signalIntensities: [10, 10],
    signals: [
      [0, 1.1, -4],
      [0, 2.0, 8.1],
    ],
    aabbs: [...wallsAABBs, ...furnitureAABBs],
    planes: getPlanes(0.8),
  },
};

export const withoutDoor = {
  args: {
    texture: "./floorplan.png",
    textCoordScale: [1 / 20, 1 / 20],
    textCoordSoffset: [0.5, 0.5],
    isSignalIndex: false,
    signalIntensities: [10, 10],
    signals: [
      [0, 1.1, -4],
      [0, 2.0, 8.1],
    ],
    aabbs: [...wallsAABBs, ...furnitureAABBs],
  },
};

export const withoutFurniture = {
  args: {
    texture: "./floorplan.png",
    textCoordScale: [1 / 20, 1 / 20],
    textCoordSoffset: [0.5, 0.5],
    isSignalIndex: false,
    signalIntensities: [10, 10],
    signals: [
      [0, 1.1, -4],
      [0, 2.0, 8.1],
    ],
    aabbs: [...wallsAABBs],
  },
};

export const withoutWall = {
  args: {
    texture: "./floorplan.png",
    textCoordScale: [1 / 20, 1 / 20],
    textCoordSoffset: [0.5, 0.5],
    isSignalIndex: false,
    signalIntensities: [10, 10],
    signals: [
      [0, 1.1, -4],
      [0, 2.0, 8.1],
    ],
  },
};
