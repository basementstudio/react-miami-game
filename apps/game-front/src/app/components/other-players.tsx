/**
 * This component handles rendering of other players
 * Is in charge of syncing presence and player ids
 */

import { useEffect, useMemo, useRef } from "react";
import { useParty } from "./use-party";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { CarBody, MAX_VEHICLE_INSTANCES } from "./vehicle/body";
import { ServerMessage, type PresenceType } from "game-schemas";
import { unpackMessage } from "@/lib/pack";
import { create } from "zustand";

const presenceRef = {
  current: {} as Record<string, PresenceType>,
};

export interface ServerStatusStore {
  playerIds: string[];
}

export const useServerStatus = create<ServerStatusStore>(() => ({
  playerIds: [],
}));

export function OtherPlayers() {
  const { playerIds } = useServerStatus();

  const playerIdsRef = useRef<string[]>([]);
  playerIdsRef.current = playerIds;

  const party = useParty();
  const selfId = party.id;

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const messageHandler = (m: MessageEvent) => {
      const message = unpackMessage(m.data) as ServerMessage;

      switch (message.type) {
        case "pull-server-presence":
          const allUsers = message.payload.users;
          // remove self from presence update
          delete allUsers[selfId];

          const playerKeys = Object.keys(allUsers);
          useServerStatus.setState({
            playerIds: playerKeys,
          });
          Object.entries(allUsers).forEach(([id, presence]) => {
            presenceRef.current[id] = presence;
          });
          break;
        case "sync-presence":
          const usersToUpdate = message.payload.users;
          // remove self from presence update
          delete usersToUpdate[selfId];

          Object.entries(usersToUpdate).forEach(([id, presence]) => {
            const currentP = presenceRef.current[id] || {};
            presenceRef.current[id] = {
              ...currentP,
              ...presence,
            };
          });
          break;
        case "player-added":
          if (message.payload.id === party.id) return;

          useServerStatus.setState((prev) => {
            if (!prev.playerIds.includes(message.payload.id)) {
              return {
                playerIds: [...prev.playerIds, message.payload.id],
              };
            }
            return prev;
          });

          presenceRef.current[message.payload.id] = message.payload.presence;

          break;
        case "player-removed":
          useServerStatus.setState((prev) => {
            return {
              playerIds: prev.playerIds.filter(
                (id) => id !== message.payload.id
              ),
            };
          });
          delete presenceRef.current[message.payload.id];
          break;
      }
    };
    party.addEventListener("message", messageHandler, {
      signal,
    });

    return () => {
      controller.abort();
      party.removeEventListener("message", messageHandler);
    };
  }, [party, selfId]);

  return (
    <>
      {playerIds.map((id, i) =>
        i < MAX_VEHICLE_INSTANCES - 3 ? <OtherPlayer key={id} id={id} /> : null
      )}
    </>
  );
}

function OtherPlayer({ id }: { id: string }) {
  const playerRef = useRef<THREE.Group>(null);

  const carVectors = useMemo(
    () => ({
      originTimestamp: 0,
      positionCurrent: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      deltaVelocity: new THREE.Vector3(),
      wheelRotation: { current: 0 },
      visibleSteering: { current: 0 },
    }),
    []
  );

  useFrame((_, delta) => {
    const presence = presenceRef.current[id];

    if (!presence) return;
    if (!playerRef.current) return;

    if (carVectors.originTimestamp !== presence.timestamp) {
      carVectors.velocity.copy(presence.vel);
      carVectors.positionCurrent.copy(presence.pos);
      carVectors.originTimestamp = presence.timestamp;
    }

    carVectors.deltaVelocity.copy(carVectors.velocity).multiplyScalar(delta);

    carVectors.positionCurrent.add(carVectors.deltaVelocity);

    playerRef.current.position.lerp(
      carVectors.positionCurrent,
      Math.min(delta * 10, 1)
    );
    playerRef.current.quaternion.set(
      presence.rot.x,
      presence.rot.y,
      presence.rot.z,
      presence.rot.w
    );

    carVectors.wheelRotation.current = presence.wheel.x;
    carVectors.visibleSteering.current = presence.wheel.y;
  });

  return <CarBody ref={playerRef} v={carVectors} />;
}
