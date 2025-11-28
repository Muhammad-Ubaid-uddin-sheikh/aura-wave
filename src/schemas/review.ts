import { z } from "zod"
import { emailSchema, nameSchema } from "./fields";

export const reviewSchema = z.object({
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot be more than 5"),
  comment: z.string().min(1, "Comment cannot be empty"),
  reviewImages: z
    .any()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const files = Array.isArray(val) ? val : [val];
      return files;
    })
    .refine((files: any) => files.length <= 5, {
      message: "You can upload up to 5 images",
    })
    .refine(
      (files: any) => files.every((file: any) => file instanceof File),
      { message: "Each item must be a valid file" }
    ),
  reviewerName: nameSchema,
  reviewerEmail: emailSchema,
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;