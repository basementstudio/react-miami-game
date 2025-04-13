/** Inspired by https://github.com/isaac-mason/sketches/blob/main/sketches/rapier/arcade-vehicle-controller/src/sketch.tsx */

import { useFrame } from "@react-three/fiber";
import { forwardRef, useRef } from "react";
import * as THREE from "three";
import { CAR_DIMENSIONS, WHEEL } from "./constants";

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
        <mesh>
          <boxGeometry
            args={[
              CAR_DIMENSIONS.WIDTH,
              CAR_DIMENSIONS.HEIGHT,
              CAR_DIMENSIONS.LENGTH,
            ]}
          />
          <meshBasicMaterial color="#fff" />
        </mesh>

        {wheels.map((wheel, index) => (
          <group
            key={index}
            ref={(ref) => (wheelsRef.current[index] = ref)}
            position={wheel.position}
          >
            <group rotation-z={-Math.PI / 2}>
              <mesh>
                <cylinderGeometry
                  args={[WHEEL.RADIUS, WHEEL.RADIUS, WHEEL.WIDTH, 16]}
                />
                <meshStandardMaterial color="#222" />
              </mesh>
              <mesh scale={1.01}>
                <cylinderGeometry
                  args={[WHEEL.RADIUS, WHEEL.RADIUS, WHEEL.WIDTH, 6]}
                />
                <meshStandardMaterial color="#fff" wireframe />
              </mesh>
            </group>
          </group>
        ))}
      </group>
    );
  }
);

CarBody.displayName = "CarBody";
