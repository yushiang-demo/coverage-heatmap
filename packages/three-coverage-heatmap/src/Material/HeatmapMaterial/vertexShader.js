const getVertexShader = () => `
varying vec4 world_position;

void main() {
  world_position = modelMatrix * vec4(position, 1.0);
  gl_Position =  projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export { getVertexShader };
