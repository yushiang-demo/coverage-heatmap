const getVertexShader = () => `
varying vec4 world_position;

void main() {
  world_position = modelMatrix * vec4(position, 1.0);
  gl_Position =  projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  // gl_Position = vec4(uv*2.0-1.0,-1.0, 1.0);
}
`;

export { getVertexShader };
