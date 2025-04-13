/**
 * User data is visible to the server
 * Presence is visible to all clients
 */

import { z } from "zod";
import { PresenceSchema } from "./presence";


export const UserSchema = z.object({
  id: z.string(),
  shouldSyncPresence: z.boolean(),
  shouldSyncMovement: z.boolean(),
  presence: PresenceSchema
})

export type UserType = z.infer<typeof UserSchema>;
