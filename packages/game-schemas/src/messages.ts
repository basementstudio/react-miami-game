// Messages are server -> client messages

import { z } from "zod";
import { PresenceSchema } from "./presence";

export const PlayerAddedMessage = z.object({
  type: z.literal("player-added"),
  payload: z.object({
    id: z.string(),
    presence: PresenceSchema,
  }),
});

export type PlayerAddedMessageType = z.infer<typeof PlayerAddedMessage>;

export const PlayerRemovedMessage = z.object({
  type: z.literal("player-removed"),
  payload: z.object({
    id: z.string(),
  }),
});

export type PlayerRemovedMessageType = z.infer<typeof PlayerRemovedMessage>;

export const SyncPresenceMessage = z.object({
  type: z.literal("sync-presence"),
  payload: z.object({
    users: z.record(z.string(), PresenceSchema.partial()),
  }),
});

export type SyncPresenceType = z.infer<typeof SyncPresenceMessage>;

export const PullServerPresenceMessage = z.object({
  type: z.literal("pull-server-presence"),
  payload: z.object({
    users: z.record(z.string(), PresenceSchema),
  }),
});

export type PullServerPresenceMessageType = z.infer<
  typeof PullServerPresenceMessage
>;

// Union of all possible server messages
export const ServerMessageSchema = z.discriminatedUnion("type", [
  SyncPresenceMessage,
  PlayerAddedMessage,
  PlayerRemovedMessage,
  PullServerPresenceMessage,
]);

export type ServerMessage = z.infer<typeof ServerMessageSchema>; 