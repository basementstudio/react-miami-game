import { QuaternionSchema } from "./utils";

import { z } from "zod";
import { Vector3Schema } from "./utils";

// Player data schemas
export const PresenceSchema = z.object({
  name: z.string(),
  position: Vector3Schema,
  rotation: QuaternionSchema,
});

export type PresenceType = z.infer<typeof PresenceSchema>;