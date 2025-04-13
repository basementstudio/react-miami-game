/**
 * This component handles rendering of other players
 * Is in charge of syncing presence and player ids
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useParty } from "./use-party";
import { Group } from "three";
import { useFrame } from "@react-three/fiber";
import { CarBody } from "./vehicle/body";
import { ServerMessage, type PresenceType } from "game-schemas";
import { unpackMessage } from "@/lib/pack";

const presenceRef = {
  current: {} as Record<string, PresenceType>,
};

export function OtherPlayers() {
  const [playerIds, setPlayerIds] = useState<string[]>([]);

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
          console.log("pull-server-presence");
          const allUsers = message.payload.users;
          // remove self from presence update
          delete allUsers[selfId];

          const playerKeys = Object.keys(allUsers);
          setPlayerIds(playerKeys);
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
          console.log("player-added", message.payload.id);

          setPlayerIds((prev) => {
            if (!prev.includes(message.payload.id)) {
              return [...prev, message.payload.id];
            }
            return prev;
          });

          presenceRef.current[message.payload.id] = message.payload.presence;

          break;
        case "player-removed":
          console.log("player-removed", message.payload.id);
          setPlayerIds((prev) => {
            return prev.filter((id) => id !== message.payload.id);
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

  console.log(playerIds);

  return (
    <>
      {playerIds.map((id) => (
        <OtherPlayer key={id} id={id} />
      ))}
    </>
  );
}

function OtherPlayer({ id }: { id: string }) {
  const playerRef = useRef<Group>(null);

  const carVectors = useMemo(
    () => ({
      wheelRotation: { current: 0 },
      visibleSteering: { current: 0 },
    }),
    []
  );

  useFrame(() => {
    const presence = presenceRef.current[id];

    if (!presence) return;
    if (!playerRef.current) return;

    playerRef.current.position.set(
      presence.position.x,
      presence.position.y,
      presence.position.z
    );
    playerRef.current.quaternion.set(
      presence.rotation.x,
      presence.rotation.y,
      presence.rotation.z,
      presence.rotation.w
    );
    carVectors.wheelRotation.current = presence.wheelRotationX;
    carVectors.visibleSteering.current = presence.wheelRotationY;
  });

  return <CarBody ref={playerRef} v={carVectors} />;
}
