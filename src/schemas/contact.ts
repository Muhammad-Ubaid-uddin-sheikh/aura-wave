import { z } from "zod"
import { nameSchema, emailSchema, phoneSchema } from "./fields"

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  number: phoneSchema,
  message: z.string().min(2, "Message must be at least 2 characters"),
})

export type ContactFormValues = z.infer<typeof contactSchema>