import * as THREE from "three";

const vertexShader = `
    varying vec4 world_position;

    void main() {
        world_position = modelMatrix * vec4(position, 1.0);
        gl_Position =  projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const getFragmentShader = (signalCount, aabbCount, planeCount) => `
uniform vec3 signals[${signalCount}];
uniform float signalIntensity[${signalCount}];
uniform int signalCount;
uniform vec3 aabbs[${aabbCount * 2}];
uniform int aabbCount;
uniform vec3 planes[${planeCount * 2}];
uniform int planeCount;
uniform sampler2D map;
uniform bool isSignalIndex;

varying vec4 world_position;

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 opacityToHSV(float opacity) {
  float minHue = 0.7;
  float maxHue = 0.0;
  float hue = mix(minHue, maxHue, opacity);
  return hsv2rgb(vec3(hue, 1.0, 1.0));
}

float decay(float distance, float intensity) {
  return 1.0 / pow(distance / intensity + 1.0, 2.0);
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

float PointInOrOn(vec3 P1, vec3 P2, vec3 A, vec3 B) {
  vec3 CP1 = cross(B - A, P1 - A);
  vec3 CP2 = cross(B - A, P2 - A);
  return step(0.0, dot(CP1, CP2));
}

bool PointInTriangle(vec3 px, vec3 p0, vec3 p1, vec3 p2) {
  return PointInOrOn(px, p0, p1, p2) * PointInOrOn(px, p1, p2, p0) * PointInOrOn(px, p2, p0, p1) < 1e-3;
}

vec3 IntersectPlane(vec3 rayOrigin, vec3 rayDir, vec3 p0, vec3 p1, vec3 p2) {
  vec3 D = rayDir;
  vec3 N = cross(p1 - p0, p2 - p0);
  vec3 X = rayOrigin + D * dot(p0 - rayOrigin, N) / dot(D, N);
  return X;
}

bool pointOnRay(vec3 point, vec3 rayOrigin, vec3 rayDir) {
  vec3 intersectionDir = normalize(rayOrigin - point);
  return dot(intersectionDir, rayDir) < (1.0 - 1e-3);
}

bool intersect(vec3 origin, vec3 rayDir, vec3 p0, vec3 p1, vec3 p2, float maxDistance) {
  vec3 x = IntersectPlane(origin, rayDir, p0, p1, p2);
  bool noIntersections = PointInTriangle(x, p0, p1, p2) || !pointOnRay(x, origin, rayDir) || distance(x, origin) > maxDistance - 1e-3;
  return !noIntersections;
}

void main() {
  float maxSignalIndex = 1.0;
  float density = 1e-3;
  for (int signalIndex = 0; signalIndex < signalCount; signalIndex++) {
    float wallDistance = 0.0;
    vec3 signalPosition = signals[signalIndex].xyz;
    vec3 rayDir = normalize(world_position.xyz - signalPosition);

    float totalDistance = distance(world_position.xyz, signalPosition);

    for (int aabbIndex = 0; aabbIndex < aabbCount; aabbIndex++) {
      vec2 nearFar = intersectAABB(signalPosition, rayDir, aabbs[2 * aabbIndex], aabbs[2 * aabbIndex + 1]);
      bool noIntersections = nearFar.x > nearFar.y || nearFar.x < 0.0 || nearFar.x > totalDistance - 1e-3;
      if (noIntersections) {
        continue;
      }

      wallDistance += nearFar.y - nearFar.x;
    }

    for (int planeIndex = 0; planeIndex < planeCount; planeIndex++) {
      vec3 min = planes[2 * planeIndex];
      vec3 max = planes[2 * planeIndex + 1];

      vec3 p0 = min;
      vec3 p1 = vec3(max.x, min.y, max.z);
      vec3 p2 = max;
      vec3 p3 = vec3(min.x, max.y, min.z);

      if (!intersect(signalPosition, rayDir, p0, p1, p2, totalDistance) && !intersect(signalPosition, rayDir, p3, p0, p2, totalDistance)) {
        continue;
      }

      wallDistance += 0.15;
    }

    float wallDecay = wallDistance * 0.2;
    float newDensity = decay(totalDistance - wallDistance, signalIntensity[signalIndex]) - wallDecay;

    if (newDensity > density) {
      density = newDensity;
      maxSignalIndex = float(signalIndex) / float(signalCount);
    }
  }

  vec4 visualizedDensity = vec4(opacityToHSV(isSignalIndex? maxSignalIndex:density), 1.0);
  vec4 color = texture2D(map, (world_position.xz/20.0)+0.5);
  gl_FragColor = mix(color, visualizedDensity, 0.4);
}

`;

export const createHeatmapMaterial = () => {
  // https://webglreport.com/ shows max uniform vectors on mobile is 256;
  const MAX_SIGNAL_COUNT = 15;
  const MAX_AABB_COUNT = 50;
  const MAX_PLANE_COUNT = 20;

  const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      isSignalIndex: {
        value: false,
      },
      map: {
        value: null,
      },
      planeCount: {
        value: 0,
      },
      aabbCount: {
        value: 0,
      },
      signalCount: {
        value: 0,
      },
      signalIntensity: {
        value: Array(MAX_SIGNAL_COUNT).fill(10),
      },
      signals: {
        value: Array(MAX_SIGNAL_COUNT).fill(new THREE.Vector3()),
      },
      aabbs: {
        value: Array(MAX_AABB_COUNT * 2).fill(new THREE.Vector3()),
      },
      planes: {
        value: Array(MAX_PLANE_COUNT * 2).fill(new THREE.Vector3()),
      },
    },
    vertexShader,
    fragmentShader: getFragmentShader(
      MAX_SIGNAL_COUNT,
      MAX_AABB_COUNT,
      MAX_PLANE_COUNT
    ),
  });

  const setUniforms = ({
    isSignalIndex,
    planeCount,
    aabbCount,
    signalCount,
    signals,
    signalIntensity,
    aabbs,
    planes,
    map,
  }) => {
    const isDefined = (value) => value !== undefined;

    if (isDefined(isSignalIndex)) {
      material.uniforms.isSignalIndex.value = isSignalIndex;
    }

    if (isDefined(planeCount)) {
      material.uniforms.planeCount.value = planeCount;
    }

    if (isDefined(aabbCount)) {
      material.uniforms.aabbCount.value = aabbCount;
    }

    if (isDefined(signalCount)) {
      material.uniforms.signalCount.value = signalCount;
    }

    if (signalIntensity) {
      material.uniforms.signalIntensity.value = [
        ...signalIntensity,
        ...Array(MAX_SIGNAL_COUNT - signalIntensity.length).fill(0),
      ];
    }

    if (signals) {
      material.uniforms.signals.value = [
        ...signals,
        ...Array(MAX_SIGNAL_COUNT - signals.length).fill(new THREE.Vector3()),
      ];
    }

    if (aabbs) {
      material.uniforms.aabbs.value = [
        ...aabbs,
        ...Array(MAX_AABB_COUNT * 2 - aabbs.length).fill(new THREE.Vector3()),
      ];
    }

    if (planes) {
      material.uniforms.planes.value = [
        ...planes,
        ...Array(MAX_PLANE_COUNT * 2 - planes.length).fill(new THREE.Vector3()),
      ];
    }

    if (map) {
      material.uniforms.map.value = map;
    }
  };

  return { material, setUniforms };
};
