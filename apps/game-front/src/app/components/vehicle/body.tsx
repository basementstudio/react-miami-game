"use client";

/** Inspired by https://github.com/isaac-mason/sketches/blob/main/sketches/rapier/arcade-vehicle-controller/src/sketch.tsx */

import { useFrame } from "@react-three/fiber";
import { forwardRef, useRef } from "react";
import * as THREE from "three";
import { WHEEL } from "./constants";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three/examples/jsm/Addons.js";
import { createInstance } from "./instances";

const [CarInstancer, CarInstance] = createInstance();
const [WheelsInstancer, WheelsInstance] = createInstance();

export const MAX_VEHICLE_INSTANCES = 800;

export function CarBodyInstancer({ children }: { children: React.ReactNode }) {
  const result = useGLTF("/auto1.glb") as unknown as CarGLTF;

  return (
    <group>
      <CarInstancer
        frustumCulled={false}
        count={MAX_VEHICLE_INSTANCES}
        geometry={result.nodes.Body.geometry}
      >
        <meshStandardMaterial color="#323232" roughness={0} metalness={1} />
        <WheelsInstancer
          frustumCulled={false}
          count={MAX_VEHICLE_INSTANCES * 4}
          geometry={result.nodes.wheel.geometry}
        >
          <meshStandardMaterial color="#000000" roughness={0.8} />
          {children}
        </WheelsInstancer>
      </CarInstancer>
    </group>
  );
}

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
        <CarInstance
          rotation={[Math.PI / -2, Math.PI / 1, 0]}
          rotation-order="YXZ"
          frustumCulled={false}
        />

        {wheels.map((wheel, index) => (
          <group
            key={index}
            ref={(ref) => (wheelsRef.current[index] = ref)}
            position={wheel.position}
          >
            <WheelsInstance
              frustumCulled={false}
              rotation-y={index % 2 === 0 ? 0 : Math.PI}
            />
          </group>
        ))}
      </group>
    );
  }
);

CarBody.displayName = "CarBody";
