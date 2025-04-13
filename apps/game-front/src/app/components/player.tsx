import { Vector3, Group, Quaternion } from "three";
import { useParty } from "./use-party";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Car } from "./vehicle";
import { UpdatePresenceActionType } from "game-schemas";

const playerPos = new Vector3(0, 0, 0);
const playerRot = new Quaternion();

export function Player() {
  const party = useParty();

  const playerObjectRef = useRef<Group | null>(null);

  useFrame(() => {
    if (!playerObjectRef.current) return;

    playerObjectRef.current.getWorldPosition(playerPos);
    playerObjectRef.current.getWorldQuaternion(playerRot);

    const newPresence: UpdatePresenceActionType = {
      type: "update-presence",
      payload: {
        position: {
          x: playerPos.x,
          y: playerPos.y,
          z: playerPos.z,
        },
        rotation: {
          x: playerRot.x,
          y: playerRot.y,
          z: playerRot.z,
          w: playerRot.w,
        },
      },
    };

    party.send(JSON.stringify(newPresence));
  });

  return (
    <>
      <Car ref={playerObjectRef} />
    </>
  );
}
