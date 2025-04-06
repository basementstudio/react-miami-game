import type * as Party from "partykit/server";

import { z } from "zod";

// Define the same schemas as on the server
const Vector3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

const PlayerDataSchema = z.object({
  name: z.string(),
  position: Vector3Schema,
  rotation: Vector3Schema,
});

type PlayerData = z.infer<typeof PlayerDataSchema>;

// real player state, can be null
type PlayerState = PlayerData | null


// Actions (client -> server)
const UpdatePositionSchema = PlayerDataSchema.pick({
  position: true,
  rotation: true,
}).extend({
  type: z.literal("update-position"),
});

const InitPlayerSchema = PlayerDataSchema.pick({
  name: true,
  position: true,
  rotation: true,
}).extend({
  type: z.literal("init-player"),
});

// Messages (server -> client)
const PresenceSchema = z.object({
  type: z.literal("update-presence"),
  payload: z.object({
    users: z.record(z.string(), PlayerDataSchema),
  }),
});

type PresenceMessage = z.infer<typeof PresenceSchema>;


export default class GameServer implements Party.Server {
  constructor(readonly room: Party.Room) { }

  public onConnect(connection: Party.Connection, ctx: Party.ConnectionContext): void | Promise<void> {
    this.updateUsers();
  }

  updateUsers() {
    const presenceMessage = JSON.stringify(this.getPresenceMessage());
    for (const connection of this.room.getConnections<PlayerData>()) {
      connection.send(presenceMessage);
    }
  }

  getPresenceMessage(): PresenceMessage {
    const users: Record<string, PlayerData> = {};
    for (const connection of this.room.getConnections<PlayerState>()) {
      const userState = connection.state;
      if (userState) users[connection.id] = userState;
    }
    return {
      type: "update-presence",
      payload: { users },
    }
  }

  public onMessage(message: string, sender: Party.Connection<PlayerState>) {
    // // send the message to all connected clients
    // for (const conn of this.room.getConnections()) {
    //   if (conn.id !== sender.id) {
    //     conn.send(`${sender.id} says: ${message}`);
    //   }
    // }

    const messageJson = JSON.parse(message);

    // init player
    const initPlayer = InitPlayerSchema.safeParse(messageJson);
    if (initPlayer.success) {
      const { name, position, rotation } = initPlayer.data;

      sender.setState({
        name,
        position,
        rotation,
      })

      this.updateUsers();
      return;
    }

    // update player position
    const updatePosition = UpdatePositionSchema.safeParse(messageJson);
    if (updatePosition.success) {
      const { position, rotation } = updatePosition.data;

      sender.setState((prevState) => {
        if (!prevState) return null;
        return {
          ...prevState,
          position,
          rotation,
        }
      })
      this.updateUsers();
      return;
    }
  }

  onClose() {
    this.updateUsers();
  }

  onError() {
    this.updateUsers();
  }
}

