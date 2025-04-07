/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  CylinderCollider,
  RapierRigidBody,
  RigidBody,
  useRapier,
  useRevoluteJoint,
} from "@react-three/rapier";
import {
  createRef,
  forwardRef,
  RefObject,
  useEffect,
  useMemo,
  useRef,
} from "react";

enum MotorModel {
  AccelerationBased = 0,
  ForceBased = 1,
}

import { lerp } from "three/src/math/MathUtils.js";

import { GameControls } from "../game";
import { Group } from "three";

const wheelX = 5;
const wheelZ = 2;

export const Vehicle = forwardRef<Group>(function VehicleInner(_, ref) {
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const wheelPositions: [number, number, number, boolean][] = [
    [wheelX, 0, wheelZ, false], // back left
    [wheelX, 0, -wheelZ, false], // back right
    [-wheelX, 0, wheelZ, true], // front left
    [-wheelX, 0, -wheelZ, true], // front right
  ];
  const wheelRefs = useRef(
    wheelPositions.map(() => createRef<RapierRigidBody>())
  );

  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.setTranslation({ x: 0, y: 5, z: 0 }, true);
  }, []);

  useInterval(() => {
    if (!bodyRef.current) return;
    bodyRef.current.wakeUp();
  }, 1000);

  const [, getKeys] = useKeyboardControls<GameControls>();

  useFrame(() => {
    if (!bodyRef.current) return;

    const keys = getKeys();

    if (keys.left) {
      bodyRef.current.applyTorqueImpulse({ x: 0, y: 30, z: 0 }, true);
    } else if (keys.right) {
      bodyRef.current.applyTorqueImpulse({ x: 0, y: -5, z: 0 }, true);
    }

    // if (keys.forward) {
    //   bodyRef.current.applyImpulse({ x: -3, y: 0, z: 0 }, true)
    // } else if (keys.backward) {
    //   bodyRef.current.applyImpulse({ x: 3, y: 0, z: 0 }, true)
    // }
  });

  return (
    <group position={[0, 6, 0]}>
      <RigidBody
        position={[0, 6, 0]}
        colliders="cuboid"
        ref={bodyRef}
        type="dynamic"
        mass={200}
        // linearDamping={0.5}
        // angularDamping={0.5}
        // friction={0.7}
      >
        <group ref={ref}>
          <Box scale={[6, 1, 1.9]} castShadow receiveShadow name="chassis">
            <meshBasicMaterial color={"red"} />
          </Box>
        </group>
      </RigidBody>
      {wheelPositions.map(([x, y, z, _isFront], index) => (
        <RigidBody
          position={[x, y, z]}
          type="dynamic"
          key={index}
          ref={wheelRefs.current[index]}
          mass={10}
          linearDamping={0.3}
          // angularDamping={0.5}
          friction={30}
          restitution={0.2}
        >
          <CylinderCollider rotation={[Math.PI / 2, 0, 0]} args={[0.5, 1]} />
        </RigidBody>
      ))}
      {wheelPositions.map(([x, y, z, isFront], index) => (
        <WheelJoint
          key={index}
          body={bodyRef as any}
          wheel={wheelRefs.current[index] as any}
          bodyAnchor={[x, y, z]}
          wheelAnchor={[0, 0, 0]}
          rotationAxis={[0, 0, 1]}
          isFront={isFront}
        />
      ))}
    </group>
  );
});

type Vector3Array = [number, number, number];

const WheelJoint = ({
  body: bodyRef,
  wheel: wheelRef,
  bodyAnchor,
  wheelAnchor,
  rotationAxis,
  isFront,
}: {
  body: RefObject<RapierRigidBody>;
  wheel: RefObject<RapierRigidBody>;
  bodyAnchor: Vector3Array;
  wheelAnchor: Vector3Array;
  rotationAxis: Vector3Array;
  isFront: boolean;
}) => {
  const [, getKeys] = useKeyboardControls<GameControls>();
  const { world } = useRapier();

  const joint = useRevoluteJoint(bodyRef, wheelRef, [
    bodyAnchor,
    wheelAnchor,
    rotationAxis,
  ]);

  joint.current.

  const vectors = useMemo(
    () => ({
      velocity: 0,
    }),
    []
  );

  useEffect(() => {
    if (!joint.current || !wheelRef.current) return;
    joint.current.configureMotorModel(MotorModel.AccelerationBased);
  }, []);

  useFrame(() => {
    if (!joint.current || !wheelRef.current) return;

    const keys = getKeys();

    if (isFront) return;

    let desiredVelocity = 0;

    // Handle forward/backward movement
    if (keys.forward) {
      desiredVelocity = 15;
      // joint.current.configureMotorVelocity(10, 50)
    } else if (keys.back) {
      desiredVelocity = -15;
      // joint.current.configureMotorVelocity(-10, 50)
    } else {
      desiredVelocity = 0;
      // joint.current.configureMotorVelocity(0, 50)
    }

    vectors.velocity = lerp(vectors.velocity, desiredVelocity, 0.1);

    joint.current.configureMotorVelocity(vectors.velocity, 50);
  });

  return null;
};

function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  useEffect(() => {
    const interval = setInterval(() => {
      savedCallback.current();
    }, delay);
    return () => clearInterval(interval);
  }, [delay]);
}
