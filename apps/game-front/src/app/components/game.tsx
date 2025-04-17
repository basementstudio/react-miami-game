"use client";

import { Canvas } from "@react-three/fiber";
import {
  Environment,
  KeyboardControls,
  KeyboardControlsEntry,
  PerspectiveCamera,
} from "@react-three/drei";
import { memo, Suspense, useEffect } from "react";
import usePartySocket from "partysocket/react";
import { Player } from "./player";
import { PartyProvider } from "./use-party";
import { OtherPlayers } from "./other-players";
import { Physics } from "@react-three/rapier";
import { Ground } from "./ground";
import { InitUserActionType } from "game-schemas";
import { packMessage } from "@/lib/pack";
import { Track } from "./track";
import { CarBodyInstancer } from "./vehicle/body";
import { GradientBackground } from "./gradient";
import { create } from "zustand";
import { WasdControls } from "./wasd-controls";

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

interface GameStore {
  debug: boolean;
}

export const useGame = create<GameStore>(() => ({
  debug: false,
}));

function Game({ roomId }: { roomId: string }) {
  const debug = useGame((s) => s.debug);

  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTY_SOCKET_HOST,
    room: roomId,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);

    const debug = urlParams.has("debug");
    if (debug) useGame.setState({ debug: true });
  }, []);

  useEffect(() => {
    const initPlayer: InitUserActionType = {
      type: "init-user",
      payload: {
        name: "John Doe",
        pos: {
          x: 0,
          y: 0,
          z: 0,
        },
        rot: {
          x: 0,
          y: 0,
          z: 0,
          w: 1,
        },
        wheel: {
          x: 0,
          y: 0,
        },
        vel: {
          x: 0,
          y: 0,
          z: 0,
        },
        timestamp: performance.now(),
      },
    };

    socket.send(packMessage(initPlayer));
  }, [socket]);

  return (
    <Physics interpolate timeStep={1 / 60}>
      <PerspectiveCamera makeDefault position={[0, 0, 0]} fov={50} />
      <KeyboardControls map={controlMap}>
        <PartyProvider socket={socket}>
          <Suspense fallback={null}>
            <CarBodyInstancer>
              <Player />
              <OtherPlayers />
            </CarBodyInstancer>
            <Ground />
            <Track />
          </Suspense>
          <GradientBackground colorA="#d1d0ff" colorB="#ffd5cf" />
          <Environment frames={2} preset="sunset">
            <mesh
              receiveShadow
              position={[0, -0.5, 0]}
              rotation-x={-Math.PI / 2}
            >
              <planeGeometry args={[100, 100]} />
              <meshBasicMaterial color="#343434" />
            </mesh>
          </Environment>
        </PartyProvider>
        {debug && <WasdControls />}
      </KeyboardControls>
    </Physics>
  );
}

function GameCanvasInner({ roomId }: { roomId: string }) {
  return (
    <Canvas dpr={[1, 1.5]}>
      <Game roomId={roomId} />
    </Canvas>
  );
}

export const GameCanvas = memo(GameCanvasInner);
