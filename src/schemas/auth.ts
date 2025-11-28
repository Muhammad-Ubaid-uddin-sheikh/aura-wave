import { z } from "zod";
import { nameSchema, emailSchema, createPasswordSchema } from "./fields";

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: createPasswordSchema,
});