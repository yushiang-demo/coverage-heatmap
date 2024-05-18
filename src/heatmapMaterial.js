import * as THREE from "three";

const vertexShader = `
    varying vec4 world_position;

    void main() {
        world_position = modelMatrix * vec4(position, 1.0);
        gl_Position =  projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const getFragmentShader = (apCount, wallCount, triangleCount) => `
uniform vec3 aps[${apCount}];
uniform int apCount;
uniform vec3 walls[${wallCount * 2}];
uniform int wallCount;
uniform vec3 triangles[${triangleCount * 3}];
uniform int triangleCount;

varying vec4 world_position;

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 opacityToHSV(float opacity) {
  // Define the range of hues (0.0 to 1.0)
  float minHue = 1.0;
  float maxHue = 0.0;

  // Map opacity to hue
  float hue = mix(minHue, maxHue, opacity);

  // Convert hue to RGB in HSV color space
  return hsv2rgb(vec3(hue, 1.0, 1.0));
}

float decay(float distance) {
  return 1.0 / pow(distance / 20.0 + 1.0, 2.0);
}

// adapted from intersectCube in https://github.com/evanw/webgl-path-tracing/blob/master/webgl-path-tracing.js
// compute the near and far intersections of the cube (stored in the x and y components) using the slab method
// no intersection means vec.x > vec.y (really tNear > tFar)
vec2 intersectAABB(vec3 rayOrigin, vec3 rayDir, vec3 boxMin, vec3 boxMax) {
  vec3 tMin = (boxMin - rayOrigin) / rayDir;
  vec3 tMax = (boxMax - rayOrigin) / rayDir;
  vec3 t1 = min(tMin, tMax);
  vec3 t2 = max(tMin, tMax);
  float tNear = max(max(t1.x, t1.y), t1.z);
  float tFar = min(min(t2.x, t2.y), t2.z);
  return vec2(tNear, tFar);
}

float PointInOrOn( vec3 P1, vec3 P2, vec3 A, vec3 B ) {
    vec3 CP1 = cross(B - A, P1 - A);
    vec3 CP2 = cross(B - A, P2 - A);
    return step(0.0, dot(CP1, CP2));
}

bool PointInTriangle( vec3 px, vec3 p0, vec3 p1, vec3 p2 ) {
    return PointInOrOn(px, p0, p1, p2) * PointInOrOn(px, p1, p2, p0) * PointInOrOn(px, p2, p0, p1) < 1e-3;
}

vec3 IntersectPlane(vec3 rayOrigin, vec3 rayDir, vec3 p0, vec3 p1, vec3 p2) {
    vec3 D = rayDir;
    vec3 N = cross(p1-p0, p2-p0);
    vec3 X = rayOrigin + D * dot(p0 - rayOrigin, N) / dot(D, N);

    return X;
}

bool pointOnRay(vec3 point, vec3 rayOrigin, vec3 rayDir){
  vec3 intersectionDir = normalize(rayOrigin - point);
  return dot(intersectionDir, rayDir) < (1.0-1e-3);
}

bool IntersectTriangle(vec3 rayOrigin, vec3 rayDir, vec3 p0, vec3 p1, vec3 p2) {
    vec3 x = IntersectPlane(rayOrigin, rayDir, p0, p1, p2);
    return !PointInTriangle(x, p0, p1, p2) && pointOnRay(x, rayOrigin, rayDir);
}

void main() {

  float maxApIndex = 0.0;
  float density = 0.0;
  for(int apIndex=0; apIndex < apCount; apIndex++) {
    float wallDistance = 0.0;
    vec3 apPosition = aps[apIndex].xyz;
    vec3 rayDir = normalize(world_position.xyz - apPosition);

    float totalDistance = distance(world_position.xyz, apPosition);

    for (int wallIndex = 0; wallIndex < wallCount; wallIndex++) {
      vec2 nearFar = intersectAABB(apPosition, rayDir, walls[2 * wallIndex], walls[2 * wallIndex + 1]);
      bool noIntersections = nearFar.x > nearFar.y || nearFar.x < 0.0 ||nearFar.x > totalDistance - 1e-3;
      if (noIntersections) {
        continue;
      }

      wallDistance += nearFar.y - nearFar.x;
    }


    for(int triangleIndex = 0; triangleIndex < triangleCount; triangleIndex++) {
      vec3 p0 = triangles[3*triangleIndex];
      vec3 p1 = triangles[3*triangleIndex+1];
      vec3 p2 = triangles[3*triangleIndex+2];
      if(IntersectTriangle(apPosition, rayDir, p0, p1, p2)){
        wallDistance += 0.15;
      }
    }

    float wallDecay = wallDistance * 0.2;
    float newDensity = decay(totalDistance - wallDistance) - wallDecay;
    
    if(newDensity > density){
      density = newDensity;
      maxApIndex = float(apIndex) / float(apCount);
    }
    
  }

  gl_FragColor = vec4(opacityToHSV(density), 1.0);
}
`;

export const createHeatmapMaterial = () => {
  const MAX_AP_COUNT = 100;
  const MAX_WALL_COUNT = 100;
  const MAX_TRIANGLE_COUNT = 100;

  const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      triangleCount: {
        value: 0,
      },
      wallCount: {
        value: 0,
      },
      apCount: {
        value: 0,
      },
      aps: {
        value: Array(MAX_AP_COUNT).fill(new THREE.Vector3()),
      },
      walls: {
        value: Array(MAX_WALL_COUNT * 2).fill(new THREE.Vector3()),
      },
      triangles: {
        value: Array(MAX_TRIANGLE_COUNT * 3).fill(new THREE.Vector3()),
      },
    },
    vertexShader,
    fragmentShader: getFragmentShader(
      MAX_AP_COUNT,
      MAX_WALL_COUNT,
      MAX_TRIANGLE_COUNT
    ),
  });

  const setUniforms = ({
    triangleCount,
    wallCount,
    apCount,
    aps,
    walls,
    triangles,
  }) => {
    if (triangleCount) {
      material.uniforms.triangleCount.value = triangleCount;
    }

    if (wallCount) {
      material.uniforms.wallCount.value = wallCount;
    }

    if (apCount) {
      material.uniforms.apCount.value = apCount;
    }

    if (aps) {
      material.uniforms.aps.value = [
        ...aps,
        ...Array(MAX_AP_COUNT - aps.length).fill(new THREE.Vector3()),
      ];
    }

    if (walls) {
      material.uniforms.walls.value = [
        ...walls,
        ...Array(MAX_WALL_COUNT * 2 - walls.length).fill(new THREE.Vector3()),
      ];
    }

    if (triangles) {
      material.uniforms.triangles.value = [
        ...triangles,
        ...Array(MAX_TRIANGLE_COUNT * 3 - triangles.length).fill(
          new THREE.Vector3()
        ),
      ];
    }
  };

  return { material, setUniforms };
};
