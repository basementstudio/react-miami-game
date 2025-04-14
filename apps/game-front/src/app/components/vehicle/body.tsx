/** Inspired by https://github.com/isaac-mason/sketches/blob/main/sketches/rapier/arcade-vehicle-controller/src/sketch.tsx */

import { useFrame } from "@react-three/fiber";
import { forwardRef, useRef } from "react";
import * as THREE from "three";
import { WHEEL } from "./constants";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three/examples/jsm/Addons.js";

const wheels = [
  // front
  {
    position: new THREE.Vector3(
      -WHEEL.SIDE_OFFSET,
      WHEEL.HEIGHT_OFFSET,
      WHEEL.FRONT_OFFSET
    ),
  },
  {
    position: new THREE.Vector3(
      WHEEL.SIDE_OFFSET,
      WHEEL.HEIGHT_OFFSET,
      WHEEL.FRONT_OFFSET
    ),
  },
  // rear
  {
    position: new THREE.Vector3(
      -WHEEL.SIDE_OFFSET,
      WHEEL.HEIGHT_OFFSET,
      WHEEL.REAR_OFFSET
    ),
  },
  {
    position: new THREE.Vector3(
      WHEEL.SIDE_OFFSET,
      WHEEL.HEIGHT_OFFSET,
      WHEEL.REAR_OFFSET
    ),
  },
];

interface CarGLTF extends GLTF {
  nodes: {
    Body: THREE.Mesh;
    antena: THREE.Mesh;
    wheel: THREE.Mesh;
  };
}

export interface VehicleVectors {
  wheelRotation: { current: number };
  visibleSteering: { current: number };
}

export const CarBody = forwardRef<THREE.Group, { v: VehicleVectors }>(
  ({ v }, ref) => {
    const result = useGLTF("/auto1.glb") as unknown as CarGLTF;

    const wheelsRef = useRef<(THREE.Object3D | null)[]>([]);

    useFrame(() => {
      wheelsRef.current.forEach((wheel) => {
        if (!wheel) return;

        wheel.rotation.order = "YXZ";
        wheel.rotation.x = v.wheelRotation.current;
      });

      wheelsRef.current[1]!.rotation.y = v.visibleSteering.current * 0.5;
      wheelsRef.current[0]!.rotation.y = v.visibleSteering.current * 0.5;
    });

    return (
      <group ref={ref}>
        <mesh
          // rotation-y={Math.PI / 2}
          // rotation-x={Math.PI / -2}
          rotation={[Math.PI / -2, Math.PI / 1, 0]}
          rotation-order="YXZ"
          geometry={result.nodes.Body.geometry}
        >
          <meshPhysicalMaterial color="#323232" roughness={0} metalness={1} />
        </mesh>
        {wheels.map((wheel, index) => (
          <group
            key={index}
            ref={(ref) => (wheelsRef.current[index] = ref)}
            position={wheel.position}
          >
            <group>
              <mesh
                rotation-y={index % 2 === 0 ? 0 : Math.PI}
                geometry={result.nodes.wheel.geometry}
              >
                <meshStandardMaterial color="#000000" roughness={0.8} />
              </mesh>
            </group>
          </group>
        ))}
      </group>
    );
  }
);

CarBody.displayName = "CarBody";
