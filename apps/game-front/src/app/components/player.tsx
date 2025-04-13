import { Group } from "three";
import { useRef } from "react";
import { CarController } from "./vehicle/controller";

export function Player() {
  const playerObjectRef = useRef<Group | null>(null);

  return (
    <>
      <CarController ref={playerObjectRef} />
    </>
  );
}
