"use client";

import { Canvas } from "@react-three/fiber";
import {
  KeyboardControls,
  KeyboardControlsEntry,
  OrbitControls,
} from "@react-three/drei";
import { useEffect } from "react";
import usePartySocket from "partysocket/react";
import { Player } from "./player";
import { PartyProvider } from "./use-party";
import { OtherPlayers } from "./other-players";

export enum GameControls {
  forward = "forward",
  back = "back",
  left = "left",
  right = "right",
}

const controlMap = [
  { name: GameControls.forward, keys: ["ArrowUp", "KeyW"] },
  { name: GameControls.back, keys: ["ArrowDown", "KeyS"] },
  { name: GameControls.left, keys: ["ArrowLeft", "KeyA"] },
  { name: GameControls.right, keys: ["ArrowRight", "KeyD"] },
] satisfies KeyboardControlsEntry<GameControls>[];

function Game() {
  const socket = usePartySocket({
    host: "localhost:1999",
    room: "game",
  });

  useEffect(() => {
    socket.send(
      JSON.stringify({
        type: "init-player",
        name: "John Doe",
        position: {
          x: 0,
          y: 0,
          z: 0,
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0,
        },
      })
    );
  }, [socket]);

  return (
    <KeyboardControls map={controlMap}>
      <PartyProvider socket={socket}>
        <ambientLight intensity={0.5} />
        <pointLight
          castShadow
          position={[10, 10, 10]}
          intensity={500}
          distance={300}
        />
        <Player />
        <OtherPlayers />
        <mesh receiveShadow position={[0, -0.5, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[100, 100]} />
          <meshPhysicalMaterial color="white" roughness={0.9} metalness={0} />
        </mesh>
        <OrbitControls />
      </PartyProvider>
    </KeyboardControls>
  );
}

export function GameCanvas() {
  return (
    <Canvas shadows>
      <Game />
    </Canvas>
  );
}
