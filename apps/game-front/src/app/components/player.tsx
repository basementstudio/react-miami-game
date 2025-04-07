import { Vector3, Group } from "three";
import { useParty } from "./use-party";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vehicle } from "./vehicle";

const playerPos = new Vector3(0, 0, 0);
const playerRot = new Vector3(0, 0, 0);

export function Player() {
  const party = useParty();

  const playerObjectRef = useRef<Group | null>(null);

  // const [, get] = useKeyboardControls<GameControls>();

  // useFrame(() => {
  //   const forward = get().forward;
  //   const back = get().back;
  //   const left = get().left;
  //   const right = get().right;

  //   if (forward) {
  //     playerPos.z -= 0.01;
  //   }
  //   if (back) {
  //     playerPos.z += 0.01;
  //   }
  //   if (left) {
  //     playerPos.x -= 0.01;
  //   }
  //   if (right) {
  //     playerPos.x += 0.01;
  //   }
  // });

  useFrame(() => {
    if (!playerObjectRef.current) return;

    playerPos.copy(playerObjectRef.current.position);

    party.send(
      JSON.stringify({
        type: "update-position",
        position: {
          x: playerPos.x,
          y: playerPos.y,
          z: playerPos.z,
        },
        rotation: {
          x: playerRot.x,
          y: playerRot.y,
          z: playerRot.z,
        },
      })
    );
  });

  return (
    <>
      <Vehicle ref={playerObjectRef} />
    </>
  );
}
