import { QuaternionSchema, Vector2Schema } from "./utils";

import { z } from "zod";
import { Vector3Schema } from "./utils";

// Player data schemas
export const PresenceSchema = z.object({
  name: z.string(),
  /** Player position */
  pos: Vector3Schema,
  /** Movement on eachframe */
  vel: Vector3Schema,
  /** Player rotation */
  rot: QuaternionSchema,
  /** Wheel rotation */
  wheel: Vector2Schema,
  /** Timestamp of the update frame */
  timestamp: z.number()
});

export type PresenceType = z.infer<typeof PresenceSchema>;