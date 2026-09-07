import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must contain at least 2 characters.")
    .max(60, "Category name cannot exceed 60 characters."),

  description: z
    .string()
    .trim()
    .max(300, "Description cannot exceed 300 characters."),

  isActive: z.boolean(),

  sortOrder: z
    .number()
    .int("Sort order must be a whole number.")
    .min(0, "Sort order cannot be negative."),
});

export type CategoryInput = z.infer<typeof categorySchema>;
