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

// Actions
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

export default class GameServer implements Party.Server {
  constructor(readonly room: Party.Room) { }

  public onConnect(connection: Party.Connection, ctx: Party.ConnectionContext): void | Promise<void> {

  }

  public onMessage(message: string, sender: Party.Connection<PlayerData>) {
    // // send the message to all connected clients
    // for (const conn of this.room.getConnections()) {
    //   if (conn.id !== sender.id) {
    //     conn.send(`${sender.id} says: ${message}`);
    //   }
    // }

    const messageJson = JSON.parse(message);

    const initPlayer = InitPlayerSchema.safeParse(messageJson);
    if (initPlayer.success) {
      const { name, position, rotation } = initPlayer.data;

      sender.setState({
        name,
        position,
        rotation,
      })

      return;
    }
    const updatePosition = UpdatePositionSchema.safeParse(messageJson);
    if (updatePosition.success) {
      const { position, rotation } = updatePosition.data;

      sender.setState((prevState) => {
        if (!prevState) throw new Error("No state");
        return {
          ...prevState,
          position,
          rotation,
        }
      })

      return;
    }


  }
}

