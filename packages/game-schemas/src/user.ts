import { z } from "zod";
import { PresenceSchema } from "./presence";


export const UserSchema = z.object({
  id: z.string(),
  presence: PresenceSchema
})

export type UserType = z.infer<typeof UserSchema>;

// Client -> Server actions

export const InitUserAction = z.object({
  type: z.literal("init-user"),
  payload: PresenceSchema,
});

export type InitUserActionType = z.infer<typeof InitUserAction>;

export const UpdatePresenceAction = z.object({
  type: z.literal("update-presence"),
  payload: PresenceSchema.partial(),
});

export type UpdatePresenceActionType = z.infer<typeof UpdatePresenceAction>;

// Server -> Client messages
export const SyncPresenceMessage = z.object({
  type: z.literal("sync-presence"),
  payload: z.object({
    users: z.record(z.string(), PresenceSchema),
  }),
});

export type SyncPresenceType = z.infer<typeof SyncPresenceMessage>;

// Union of all possible client actions
export const ClientActionSchema = z.discriminatedUnion("type", [
  InitUserAction,
  UpdatePresenceAction,
]);

export type ClientAction = z.infer<typeof ClientActionSchema>;

// Union of all possible server messages
export const ServerMessageSchema = z.discriminatedUnion("type", [
  SyncPresenceMessage,
]);

export type ServerMessage = z.infer<typeof ServerMessageSchema>; 