/**
 * Logic to control the vehicle by the player
 * It will handle both keyboard and joystick controls
 * Physics inspired by https://github.com/isaac-mason/sketches/blob/main/sketches/rapier/arcade-vehicle-controller/src/sketch.tsx
 * */

import { useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import throttle from "lodash.throttle";
import {
  BallCollider,
  RapierRigidBody,
  RigidBody,
  RigidBodyProps,
  useBeforePhysicsStep,
  useRapier,
} from "@react-three/rapier";
import { forwardRef, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GameControls } from "../game";
import { valueRemap } from "@/lib/math";
import { clamp, degToRad } from "three/src/math/MathUtils.js";
import {
  controlsInstance,
  useControlsPeerEvent,
  useOnControlsMessage,
} from "@/hooks/use-peer-controls";
import { CarBody } from "./body";
import { CAR_DIMENSIONS, WHEEL } from "./constants";
import { UpdatePresenceActionType } from "game-schemas";
import { useParty } from "../use-party";
import { packMessage } from "@/lib/pack";

const up = new THREE.Vector3(0, 1, 0);
const maxForwardSpeed = 6;
const maxReverseSpeed = -4;

const CAMERA = {
  positionOffset: new THREE.Vector3(0, 0.4, 0.8),
  lookAtOffset: new THREE.Vector3(0, 0, -2),
  // positionOffset: new THREE.Vector3(0.3, 0.2, 0.2),
  // lookAtOffset: new THREE.Vector3(0, 0, 0),
  cameraTargetPosition: new THREE.Vector3(0, 0, 0),
  cameraTargetLookat: new THREE.Vector3(),
  cameraPosition: new THREE.Vector3(),
  cameraLookat: new THREE.Vector3(),
};

const bodyPosition = new THREE.Vector3();
const _bodyEuler = new THREE.Euler();
const _cameraPosition = new THREE.Vector3();
const _impulse = new THREE.Vector3();

// TODO: replace this with _bodyPosition
const playerPos = new THREE.Vector3(0, 0, 0);
const playerRot = new THREE.Quaternion();

const initialPosition = new THREE.Vector3(
  -1.1688942909240723,
  0.2,
  9.06745433807373
);

export const CarController = forwardRef<THREE.Group, RigidBodyProps>(
  (props, ref) => {
    const { rapier, world } = useRapier();

    const vectors = useMemo(
      () => ({
        activeJoystick: { current: false },
        joystickRotation: { current: 0 },
        joystickAcceleration: { current: false },
        joystickBrake: { current: false },
        wheelRotation: { current: 0 },
        steeringInput: { current: 0 },
        visibleSteering: { current: 0 },
      }),
      []
    );

    // update multiplayer
    const party = useParty();

    const updatePosition = useMemo(() => {
      const newPresence = {
        type: "update-presence",
        payload: {
          pos: {
            x: playerPos.x,
            y: playerPos.y,
            z: playerPos.z,
          },
          rot: {
            x: playerRot.x,
            y: playerRot.y,
            z: playerRot.z,
            w: playerRot.w,
          },
          wheel: {
            x: vectors.wheelRotation.current,
            y: vectors.visibleSteering.current,
          },
        },
      } satisfies UpdatePresenceActionType;

      return throttle(() => {
        if (!groupRef.current) return;

        groupRef.current.getWorldPosition(playerPos);
        groupRef.current.getWorldQuaternion(playerRot);

        newPresence.payload.pos.x = playerPos.x;
        newPresence.payload.pos.y = playerPos.y;
        newPresence.payload.pos.z = playerPos.z;
        newPresence.payload.rot.x = playerRot.x;
        newPresence.payload.rot.y = playerRot.y;
        newPresence.payload.rot.z = playerRot.z;
        newPresence.payload.rot.w = playerRot.w;
        newPresence.payload.wheel.x = vectors.wheelRotation.current;
        newPresence.payload.wheel.y = vectors.visibleSteering.current;

        party.send(packMessage(newPresence));
      }, 1000 / 20);
    }, [party, vectors]);

    useFrame(() => {
      if (!groupRef.current) return;

      updatePosition();
    });

    // joystick controls
    useControlsPeerEvent("connection", () => {
      vectors.activeJoystick.current = true;
    });

    useControlsPeerEvent("disconnected", () => {
      if (Object.keys(controlsInstance.connections).length === 0) {
        vectors.activeJoystick.current = false;
      }
    });

    useOnControlsMessage("steeringAngle", (message) => {
      vectors.joystickRotation.current = message.data;
    });

    useOnControlsMessage("acceleration", (message) => {
      vectors.joystickAcceleration.current = message.data;
    });

    useOnControlsMessage("brake", (message) => {
      vectors.joystickBrake.current = message.data;
    });

    // physics
    const bodyRef = useRef<RapierRigidBody>(null!);
    const groupRef = useRef<THREE.Group>(null!);

    const steeringAngle = useRef(0);
    const steeringAngleQuat = useRef(new THREE.Quaternion());

    const driftSteeringAngle = useRef(0);

    const driftingLeft = useRef(false);
    const driftingRight = useRef(false);
    const driftSteeringVisualAngle = useRef(0);

    const speed = useRef(0);
    const grounded = useRef(false);

    const [, getKeyboardControls] = useKeyboardControls<GameControls>();

    useBeforePhysicsStep(() => {
      const controls = getKeyboardControls();
      const { forward, back, left, right, drift } = controls;

      const impulse = _impulse.set(0, 0, -speed.current).multiplyScalar(5);

      // check if grounded
      const groundRayResult = world.castRay(
        new rapier.Ray(bodyRef.current.translation(), { x: 0, y: -1, z: 0 }),
        1,
        false,
        undefined,
        undefined,
        undefined,
        bodyRef.current
      );
      grounded.current = groundRayResult !== null;

      // steering angle
      vectors.steeringInput.current = Number(left) - Number(right);
      vectors.visibleSteering.current = vectors.steeringInput.current;
      // udpate angle based on direction
      if (impulse.z > 0) {
        vectors.steeringInput.current *= -1;
      }

      // drifting controls
      if (!drift) {
        driftingLeft.current = false;
        driftingRight.current = false;
      }

      if (drift && grounded.current && 1 < speed.current) {
        if (left) {
          driftingLeft.current = true;
        }

        if (right) {
          driftingRight.current = true;
        }

        if (
          (driftingLeft.current && driftingRight.current) ||
          (!left && !right)
        ) {
          driftingLeft.current = false;
          driftingRight.current = false;
        }
      } else {
        driftingLeft.current = false;
        driftingRight.current = false;
      }

      // drift steering
      let driftSteeringTarget = 0;

      if (driftingLeft.current) {
        driftSteeringTarget = 1;
      } else if (driftingRight.current) {
        driftSteeringTarget = -1;
      }

      driftSteeringAngle.current = THREE.MathUtils.lerp(
        driftSteeringAngle.current,
        driftSteeringTarget,
        0.1
      );

      if (Math.abs(speed.current) > 0.1) {
        let steeringMultiply = valueRemap(
          Math.abs(speed.current),
          0.1,
          0.9,
          0,
          1
        );
        steeringMultiply = clamp(steeringMultiply, 0, 1);
        // update vehicle angle
        steeringAngle.current +=
          vectors.steeringInput.current * 0.02 * steeringMultiply;
        steeringAngle.current +=
          driftSteeringAngle.current * 0.01 * steeringMultiply;

        if (vectors.activeJoystick.current) {
          steeringAngle.current +=
            valueRemap(vectors.joystickRotation.current, -40, 40, 0.08, -0.08) *
            steeringMultiply;
        }
        steeringAngleQuat.current.setFromAxisAngle(up, steeringAngle.current);
        impulse.applyQuaternion(steeringAngleQuat.current);
      }

      if (vectors.activeJoystick.current) {
        vectors.visibleSteering.current =
          -degToRad(vectors.joystickRotation.current) * 2;
      }

      // acceleration and deceleration
      let speedTarget = 0;

      if (forward || vectors.joystickAcceleration.current) {
        speedTarget = maxForwardSpeed;
      } else if (back || vectors.joystickBrake.current) {
        speedTarget = maxReverseSpeed;
      }

      speed.current = THREE.MathUtils.lerp(speed.current, speedTarget, 0.03);

      // apply impulse
      if (impulse.length() > 0) {
        bodyRef.current.applyImpulse(impulse, true);
      }

      // damping
      bodyRef.current.applyImpulse(
        {
          x: -bodyRef.current.linvel().x * 1.5,
          y: -Math.abs(speed.current) * 0.45,
          z: -bodyRef.current.linvel().z * 1.5,
        },
        true
      );
    });

    useEffect(() => {
      bodyRef.current.setTranslation(initialPosition, true);
    }, []);

    const camera = useThree((state) => state.camera);

    const raycaster = new THREE.Raycaster();
    const groundNormal = new THREE.Vector3(0, 1, 0);
    const groundRayDirection = new THREE.Vector3(0, -1, 0);
    const groundRayOrigin = new THREE.Vector3();
    const groundAlignmentQuat = new THREE.Quaternion();

    useFrame(({ scene }, delta) => {
      // body position
      if (!bodyRef.current) return;

      groundRayOrigin.copy(bodyRef.current.translation());
      raycaster.set(groundRayOrigin, groundRayDirection);

      const intersects = raycaster.intersectObject(scene, true).filter((i) => {
        return i.object.userData?.isGround;
      });

      if (!intersects.length) return;

      const intersect = intersects[0];

      if (intersect.normal) {
        groundNormal.lerp(intersect.normal!, delta * 5);
      }

      groundAlignmentQuat.setFromUnitVectors(up, groundNormal);

      const finalQuat = new THREE.Quaternion().multiplyQuaternions(
        groundAlignmentQuat,
        steeringAngleQuat.current
      );

      bodyPosition.copy(intersect.point);
      bodyPosition.y += WHEEL.RADIUS - WHEEL.HEIGHT_OFFSET;
      // update mesh position
      groupRef.current.position.lerp(bodyPosition, delta * 10);
      // groupRef.current.position.copy(bodyPosition);
      // groupRef.current.position.setX(bodyPosition.x);
      // groupRef.current.position.y = THREE.MathUtils.lerp(
      //   groupRef.current.position.y,
      //   bodyPosition.y,
      //   delta * 30
      // );
      // groupRef.current.position.setZ(bodyPosition.z);

      // update mesh rotation
      groupRef.current.quaternion.copy(finalQuat);
      groupRef.current.updateMatrix();

      // drift visual angle
      driftSteeringVisualAngle.current = THREE.MathUtils.lerp(
        driftSteeringVisualAngle.current,
        driftSteeringAngle.current,
        delta * 10
      );

      // body rotation
      const bodyEuler = _bodyEuler.setFromQuaternion(
        groupRef.current.quaternion,
        "YXZ"
      );
      bodyEuler.y = bodyEuler.y + driftSteeringVisualAngle.current * 0.4;
      groupRef.current.rotation.copy(bodyEuler);

      // wheel rotation
      vectors.wheelRotation.current -= (speed.current / 10) * delta * 100;

      // camera
      if (true) {
        // update lookat
        CAMERA.cameraTargetLookat
          .copy(CAMERA.lookAtOffset)
          .applyQuaternion(groupRef.current.quaternion);
        CAMERA.cameraTargetLookat.add(bodyPosition);
        CAMERA.cameraLookat.copy(CAMERA.cameraTargetLookat);
        camera.lookAt(CAMERA.cameraLookat);

        // update position
        CAMERA.cameraTargetPosition
          .copy(CAMERA.positionOffset)
          .applyQuaternion(groupRef.current.quaternion);
        CAMERA.cameraTargetPosition.add(bodyPosition);
        CAMERA.cameraPosition.copy(CAMERA.cameraTargetPosition);
        camera.position.lerp(CAMERA.cameraPosition, delta * 10);
      }
    });

    return (
      <>
        {/* body */}
        <RigidBody
          {...props}
          ref={bodyRef}
          colliders={false}
          mass={CAR_DIMENSIONS.MASS}
          restitution={0}
          ccd
          name="player"
          type="dynamic"
        >
          <BallCollider
            args={[CAR_DIMENSIONS.COLLIDER_RADIUS]}
            mass={CAR_DIMENSIONS.MASS}
          />
        </RigidBody>

        {/* vehicle */}
        <group ref={groupRef}>
          <group ref={ref}>
            <CarBody v={vectors} />
          </group>
        </group>
      </>
    );
  }
);

CarController.displayName = "CarController";
