"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { forwardRef, useEffect } from "react";
import { Mesh } from "three";
import usePartySocket from "partysocket/react";

const Cube = forwardRef<Mesh>((_, ref) => {
  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial color="green" roughness={0.7} metalness={0.5} />
    </mesh>
  );
});

Cube.displayName = "Cube";

function Game() {
  const socket = usePartySocket({
    host: "localhost:1999",
    room: "game",
    onMessage: (message) => {
      console.log(message);
    },
  });

  useEffect(() => {
    socket.send(
      JSON.stringify({
        type: "init-player",
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
          },
        },
      })
    );
  }, [socket]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight
        castShadow
        position={[10, 10, 10]}
        intensity={500}
        distance={300}
      />
      <Cube />
      <mesh receiveShadow position={[0, -0.5, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[100, 100]} />
        <meshPhysicalMaterial color="white" roughness={0.9} metalness={0} />
      </mesh>
      <OrbitControls />
    </>
  );
}

export function GameCanvas() {
  return (
    <Canvas shadows>
      <Game />
    </Canvas>
  );
}
