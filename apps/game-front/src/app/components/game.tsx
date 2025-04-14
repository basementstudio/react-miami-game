"use client";

import { Canvas } from "@react-three/fiber";
import {
  KeyboardControls,
  KeyboardControlsEntry,
  OrbitControls,
} from "@react-three/drei";
import { Suspense, useEffect } from "react";
import usePartySocket from "partysocket/react";
import { Player } from "./player";
import { PartyProvider } from "./use-party";
import { OtherPlayers } from "./other-players";
import { Physics } from "@react-three/rapier";
import { Ground } from "./ground";
import { InitUserActionType } from "game-schemas";
import { packMessage } from "@/lib/pack";
import { Track } from "./track";

export enum GameControls {
  forward = "forward",
  back = "back",
  left = "left",
  right = "right",
  drift = "drift",
}

const controlMap = [
  { name: GameControls.forward, keys: ["ArrowUp", "KeyW"] },
  { name: GameControls.back, keys: ["ArrowDown", "KeyS"] },
  { name: GameControls.left, keys: ["ArrowLeft", "KeyA"] },
  { name: GameControls.right, keys: ["ArrowRight", "KeyD"] },
  { name: GameControls.drift, keys: ["Space"] },
] satisfies KeyboardControlsEntry<GameControls>[];

function Game() {
  const socket = usePartySocket({
    host: "localhost:1999",
    room: "game",
  });

  useEffect(() => {
    const initPlayer: InitUserActionType = {
      type: "init-user",
      payload: {
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
          w: 1,
        },
        wheelRotationX: 0,
        wheelRotationY: 0,
      },
    };

    socket.send(packMessage(initPlayer));
  }, [socket]);

  return (
    <Physics interpolate timeStep={1 / 60}>
      <KeyboardControls map={controlMap}>
        <PartyProvider socket={socket}>
          <ambientLight intensity={0.5} />
          <pointLight
            castShadow
            position={[10, 10, 10]}
            intensity={500}
            distance={300}
          />
          <Suspense fallback={null}>
            <Player />
            <OtherPlayers />
            <Ground />
            <Track />
          </Suspense>
          <OrbitControls />
        </PartyProvider>
      </KeyboardControls>
    </Physics>
  );
}

export function GameCanvas() {
  return (
    <Canvas shadows>
      <Game />
    </Canvas>
  );
}
