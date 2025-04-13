import { useEffect, useMemo, useRef, useState } from "react";
import { useParty } from "./use-party";
import { Group } from "three";
import { useFrame } from "@react-three/fiber";
import { CarBody } from "./vehicle";
import { SyncPresenceType, type PresenceType } from "game-schemas";

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

    const messageHandler = (message: MessageEvent) => {
      const messageJson = JSON.parse(message.data) as SyncPresenceType;

      switch (messageJson.type) {
        case "sync-presence":
          const presenceMessage = messageJson.payload.users;

          const selfId = party.id;

          presenceRef.current = presenceMessage;

          // remove self from presence
          delete presenceMessage[selfId];

          const connIds = Object.keys(presenceMessage);

          let changed = false;
          if (connIds.length !== playerIdsRef.current.length) {
            changed = true;
          }

          connIds.forEach((connId) => {
            if (!playerIdsRef.current.includes(connId)) {
              changed = true;
            }
          });
          if (changed) {
            setPlayerIds(connIds);
          }

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
  });

  const vectors = useMemo(
    () => ({
      wheelRotation: { current: 0 },
      steeringInput: { current: 0 },
      visibleSteering: { current: 0 },
    }),
    []
  );

  return <CarBody ref={playerRef} v={vectors} />;
}
