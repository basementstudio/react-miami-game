"use client";

/** Inspired by https://github.com/isaac-mason/sketches/blob/main/sketches/rapier/arcade-vehicle-controller/src/sketch.tsx */

import { useFrame } from "@react-three/fiber";
import { forwardRef, useMemo, useRef } from "react";
import * as THREE from "three";
import { WHEEL } from "./constants";
import { useGLTF, useTexture } from "@react-three/drei";
import { GLTF } from "three/examples/jsm/Addons.js";
import { createInstance } from "./instances";
import { useAssets } from "../assets";
import { useIsMobile } from "@/hooks/use-is-mobile";

const [CarInstancer, CarInstance] = createInstance();
const [WheelsInstancer, WheelsInstance] = createInstance();

export const MAX_VEHICLE_INSTANCES = 800;

interface CarGLTF extends GLTF {
  nodes: {
    Body: THREE.Mesh;
    antena: THREE.Mesh;
    wheel: THREE.Mesh;
  };
}

export function CarBodyInstancer({ children }: { children: React.ReactNode }) {
  const {
    models: { vehicle, bodyMobile },
  } = useAssets();

  const mobileTexture = useTexture(bodyMobile.url);
  const { nodes } = useGLTF(vehicle.url) as unknown as CarGLTF;

  const {
    bodyMaterialHigh,
    bodyMaterialLow,
    wheelMaterialHigh,
    wheelMaterialLow,
  } = useMemo(() => {
    mobileTexture.colorSpace = THREE.SRGBColorSpace;
    mobileTexture.flipY = false;
    mobileTexture.anisotropy = 8;

    const bodyMaterialHigh = (
      nodes.Body.material as THREE.MeshStandardMaterial
    ).clone();

    const bodyMaterialLow = new THREE.MeshBasicMaterial({
      map: mobileTexture,
    });

    const wheelMaterialHigh = (
      nodes.wheel.material as THREE.MeshStandardMaterial
    ).clone();

    const wheelMaterialLow = new THREE.MeshBasicMaterial({
      map: mobileTexture,
    });

    return {
      bodyMaterialHigh,
      bodyMaterialLow,
      wheelMaterialHigh,
      wheelMaterialLow,
    };
  }, [nodes, mobileTexture]);

  const isMobile = useIsMobile();
  if (typeof isMobile === "undefined") return null;

  return (
    <group>
      <CarInstancer
        frustumCulled={false}
        count={MAX_VEHICLE_INSTANCES}
        geometry={nodes.Body.geometry}
        material={isMobile ? bodyMaterialLow : bodyMaterialHigh}
      >
        <WheelsInstancer
          frustumCulled={false}
          count={MAX_VEHICLE_INSTANCES * 4}
          geometry={nodes.wheel.geometry}
          material={isMobile ? wheelMaterialLow : wheelMaterialHigh}
        >
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
        wheel.rotation.x = v.wheelRotation.current * 0.2;
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
