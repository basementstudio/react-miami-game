import { QuaternionSchema, Vector2Schema } from "./utils";

import { z } from "zod";
import { Vector3Schema } from "./utils";

// Player data schemas
export const PresenceSchema = z.object({
  name: z.string(),
  /** Player position */
  pos: Vector3Schema,
  /** Player rotation */
  rot: QuaternionSchema,
  /** Wheel rotation */
  wheel: Vector2Schema
});

export type PresenceType = z.infer<typeof PresenceSchema>;