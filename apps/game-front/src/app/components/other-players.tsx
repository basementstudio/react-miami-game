import { useEffect, useRef, useState } from "react";
import { useParty } from "./use-party";
import { Mesh } from "three";
import { Cube } from "./cube";
import { useFrame } from "@react-three/fiber";

interface Presence {
  name: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}

const presenceRef = {
  current: {} as Record<string, Presence>,
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
      const messageJson = JSON.parse(message.data);

      switch (messageJson.type) {
        case "update-presence":
          const presenceMessage = messageJson.payload.users as Record<
            string,
            Presence
          >;

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
  const playerRef = useRef<Mesh>(null);

  useFrame(() => {
    const presence = presenceRef.current[id];

    if (!presence) return;
    if (!playerRef.current) return;

    playerRef.current.position.set(
      presence.position.x,
      presence.position.y,
      presence.position.z
    );
    playerRef.current.rotation.set(
      presence.rotation.x,
      presence.rotation.y,
      presence.rotation.z
    );
  });

  return <Cube ref={playerRef} />;
}
