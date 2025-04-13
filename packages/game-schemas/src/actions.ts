// Client -> Server actions

import { z } from "zod";
import { PresenceSchema } from "./presence";

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

// Union of all possible client actions
export const ClientActionSchema = z.discriminatedUnion("type", [
  InitUserAction,
  UpdatePresenceAction,
]);

export type ClientAction = z.infer<typeof ClientActionSchema>;
