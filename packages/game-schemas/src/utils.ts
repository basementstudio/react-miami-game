import { z } from "zod";

// Base geometry schemas
export const Vector3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export const Vector2Schema = z.object({
  x: z.number(),
  y: z.number(),
});

export const QuaternionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  w: z.number(),
});