import calculateIntensity from "../heatmap.glsl";
const getFragmentShader = (signalCount, aabbCount, planeCount) => `
#define SIGNAL_COUNT ${signalCount}
#define AABB_COUNT ${aabbCount * 2}
#define PLANE_COUNT ${planeCount * 2}

${calculateIntensity}

varying vec4 world_position;

void main() {
  Result result = getSignalDensity(world_position);
  gl_FragColor = vec4(result.density, result.density, result.density, 1.0);
}
`;

export { getFragmentShader };
