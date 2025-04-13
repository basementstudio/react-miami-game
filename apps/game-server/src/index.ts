import type * as Party from "partykit/server";
import { type UserType, type SyncPresenceType, PresenceType, InitUserAction, UpdatePresenceAction, UpdatePresenceActionType, InitUserActionType } from "game-schemas";

export default class GameServer implements Party.Server {
  constructor(readonly room: Party.Room) { }

  public onConnect(connection: Party.Connection, ctx: Party.ConnectionContext): void | Promise<void> {
    this.updateUsers();
  }

  updateUsers() {
    const presenceMessage = JSON.stringify(this.getPresenceMessage());
    for (const connection of this.room.getConnections<UserType>()) {
      connection.send(presenceMessage);
    }
  }

  getPresenceMessage(): SyncPresenceType {
    const users: Record<string, PresenceType> = {};
    for (const connection of this.room.getConnections<UserType>()) {
      const userState = connection.state;
      if (userState) users[connection.id] = userState.presence;
    }
    return {
      type: "sync-presence",
      payload: { users },
    }
  }

  public onMessage(message: string, sender: Party.Connection<UserType>): void | Promise<void> {
    const messageJson = JSON.parse(message);

    if (typeof messageJson.type !== "string") return;

    switch (messageJson.type) {
      case "init-user":
        const initUser = InitUserAction.safeParse(messageJson);
        if (initUser.success) {
          return this.initPlayerAction(initUser.data, sender);
        }
        break;
      case "update-presence":
        const updatePresence = UpdatePresenceAction.safeParse(messageJson);
        if (updatePresence.success) {
          return this.updatePresenceAction(updatePresence.data, sender);
        }
    }
  }

  private initPlayerAction(action: InitUserActionType, sender: Party.Connection<UserType>) {
    sender.setState({
      id: sender.id,
      presence: action.payload,
    })
    this.updateUsers();
  }

  private updatePresenceAction(action: UpdatePresenceActionType, sender: Party.Connection<UserType>) {
    if (!sender.state || !sender.state.presence) return; // no current presence, ignore update

    sender.setState((prevState) => {
      if (!prevState) throw new Error("No previous state");
      return {
        ...prevState,
        presence: {
          ...prevState.presence,
          ...action.payload,
        },
      }
    })
    this.updateUsers();
  }

  onClose() {
    this.updateUsers();
  }

  onError() {
    this.updateUsers();
  }
}

