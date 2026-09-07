import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500),
  priceGhs: z
    .string()
    .trim()
    .min(1, "Price is required.")
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "Enter a valid price with no more than two decimal places.",
    )
    .refine((price) => Number(price) > 0, {
      message: "Price must be greater than zero.",
    }),
  imageUrl: z.string().trim().min(1, "Please upload a product image."),
  imagePublicId: z.string().trim().nullable(),
  categoryId: z.string().min(1),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
  sortOrder: z.number().int().min(0),
});

export type ProductInput = z.infer<typeof productSchema>;
