import { z } from "zod";

export const nameSchema = z.string()
  .min(1, "Name is required")
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be under 50 characters");

export const emailSchema = z.string()
  .min(1, "Email is required")
  .email("Enter a valid email address");

export const phoneSchema = z.string()
  .min(1, "Phone number is required")
  .regex(/^(\+92|92|0)?\d{10}$/, "Enter a valid Pakistani phone number (e.g., 03001234567 or +923001234567)");

export const createPasswordSchema = z.string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain numbers")
  .regex(/[@$!%*?&^#]/, "Password must contain a special character")