import * as THREE from "three";

export function GradientBackground({ colorA = "#ff5f6d", colorB = "#ffc371" }) {
  // Create shader material for gradient
  const uniforms = {
    colorA: { value: new THREE.Color(colorA) },
    colorB: { value: new THREE.Color(colorB) },
  };

  return (
    <mesh>
      <cylinderGeometry args={[100, 100, 100, 16, 16, true]} />
      <shaderMaterial
        side={THREE.BackSide}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 colorA;
          uniform vec3 colorB;
          varying vec2 vUv;
          
          void main() {
            gl_FragColor = vec4(mix(colorA, colorB, vUv.y), 1.);
          }
        `}
      />
    </mesh>
  );
}
