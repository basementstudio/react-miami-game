import type * as Party from "partykit/server";
import { type UserType, type SyncPresenceType, PresenceType, InitUserAction, UpdatePresenceAction, UpdatePresenceActionType, InitUserActionType, PlayerAddedMessageType, PlayerRemovedMessageType, PullServerPresenceMessageType } from "game-schemas";
import { z } from "zod";
import { createThrottle } from "./utils";

const objectValidation = z.object({
  type: z.string(),
  payload: z.any(),
})

const SERVER_UPDATE_FPS = 30

// import { decode, encode } from 'cbor-x';

// export function packMessage(object: unknown, type: 'string' | 'binary' = 'binary'): string | Buffer {
//   if (type === 'string') {
//     return JSON.stringify(object)
//   }

//   return encode(object)
// }

// export function unpackMessage<T>(message: string | Buffer): T {
//   if (typeof message === 'string') {
//     return JSON.parse(message)
//   } else {
//     try {
//       return decode(message)
//     } catch (e) {
//       console.log(message);
//       console.log(e);
//       throw e;
//     }
//   }
// }

function packMessage(object: unknown, _type: 'string' | 'binary' = 'binary'): string {
  return JSON.stringify(object)
}

function unpackMessage<T>(message: string): T {
  return JSON.parse(message)
}

export default class GameServer implements Party.Server {

  constructor(readonly room: Party.Room) {
  }


  static options = {
    hibernate: true
  }

  sendToAll = (message: string | ArrayBufferLike) => {
    for (const connection of this.room.getConnections<UserType>()) {
      connection.send(message);
    }
  }

  updateUsers = createThrottle(() => {
    const presenceMessage = JSON.stringify(this.getPresenceMessage());
    this.sendToAll(presenceMessage);
  }, 1000 / SERVER_UPDATE_FPS);


  public onConnect(connection: Party.Connection, _ctx: Party.ConnectionContext): void | Promise<void> {
    // send current state to this new user
    const message = this.getAllServerPresence();
    connection.send(packMessage(message, 'string'));
  }

  private markSynced(connection: Party.Connection<UserType>) {
    connection.setState((prevState) => {
      if (!prevState) throw new Error("No previous state");
      return {
        ...prevState,
        shouldSyncPresence: false,
        shouldSyncMovement: false,
      }
    })
  }

  getPresenceMessage(): SyncPresenceType {
    const users: SyncPresenceType['payload']['users'] = {};
    for (const connection of this.room.getConnections<UserType>()) {
      const userState = connection.state;
      if (!userState || !userState.presence) continue;
      if (userState.shouldSyncPresence) {
        users[connection.id] = userState.presence;
        this.markSynced(connection);
        continue;
      }
      if (userState.shouldSyncMovement) {
        // filter unwanted data
        const { name, ...rest } = userState.presence;
        users[connection.id] = rest;
        this.markSynced(connection);
        continue;
      }
    }
    return {
      type: "sync-presence",
      payload: { users },
    }
  }

  getAllServerPresence(): PullServerPresenceMessageType {
    const users: Record<string, PresenceType> = {};
    for (const connection of this.room.getConnections<UserType>()) {
      const userState = connection.state;
      if (!userState || !userState.presence) continue;
      users[connection.id] = userState.presence;
    }
    return { type: "pull-server-presence", payload: { users } };
  }

  public onMessage(message: string | ArrayBufferLike, sender: Party.Connection<UserType>): void | Promise<void> {
    const messageJson = unpackMessage(message as string);

    const parsed = objectValidation.safeParse(messageJson);
    if (!parsed.success) return;

    switch (parsed.data.type) {
      case "init-user":
        const initUser = InitUserAction.safeParse(parsed.data);
        if (initUser.success) {
          return this.initPlayerAction(initUser.data, sender);
        }
        break;
      case "update-presence":
        const updatePresence = UpdatePresenceAction.safeParse(parsed.data);
        if (updatePresence.success) {
          return this.updatePresenceAction(updatePresence.data, sender);
        }
        break;
    }
  }

  private initPlayerAction(action: InitUserActionType, sender: Party.Connection<UserType>) {
    sender.setState({
      id: sender.id,
      shouldSyncPresence: false,
      shouldSyncMovement: false,
      presence: action.payload,
    })
    // Update all clients with new player data
    this.sendPlayerAdded(sender.id, action.payload);
  }

  sendPlayerAdded(id: string, presence: PresenceType) {
    const message = {
      type: "player-added",
      payload: {
        id,
        presence,
      },
    } satisfies PlayerAddedMessageType
    this.sendToAll(packMessage(message, 'string'));
  }

  private updatePresenceAction(action: UpdatePresenceActionType, sender: Party.Connection<UserType>) {
    if (!sender.state || !sender.state.presence) return; // no current presence, ignore update

    sender.setState((prevState) => {
      if (!prevState) throw new Error("No previous state");

      const shouldSyncPresence = 'name' in action.payload

      return {
        ...prevState,
        shouldSyncPresence,
        shouldSyncMovement: !shouldSyncPresence,
        presence: {
          ...prevState.presence,
          ...action.payload,
        },
      }
    })
    this.updateUsers();
  }

  onClose(connection: Party.Connection<UserType>) {

    const message = {
      type: "player-removed",
      payload: {
        id: connection.id,
      },
    } satisfies PlayerRemovedMessageType
    this.sendToAll(packMessage(message, 'string'));
  }

  onError() {
    this.updateUsers();
  }
}

