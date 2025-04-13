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

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const messageHandler = (m: MessageEvent) => {
      const message = unpackMessage(m.data) as ServerMessage;

      switch (message.type) {
        case "sync-presence":
          const presenceMessage = message.payload.users;
          const selfId = party.id;
          // remove self from presence update
          delete presenceMessage[selfId];

          Object.entries(presenceMessage).forEach(([id, presence]) => {
            if (!(id in presenceRef.current)) return;
            presenceRef.current[id] = {
              ...presenceRef.current[id],
              ...presence,
            };
          });
          break;
        case "player-added":
          console.log("player-added", message.payload.id);

          setPlayerIds((prev) => {
            if (!prev.includes(message.payload.id)) {
              return [...prev, message.payload.id];
            }
            return prev;
          });
          break;
        case "player-removed":
          console.log("player-removed", message.payload.id);
          setPlayerIds((prev) => {
            return prev.filter((id) => id !== message.payload.id);
          });
          break;
      }
    };
    party.addEventListener("message", messageHandler, {
      signal,
    });

    return () => {
      controller.abort();
    };
  }, [party]);

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
