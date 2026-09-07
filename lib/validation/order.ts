import { z } from "zod";
export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

const checkoutBaseSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  customerPhone: z
    .string()
    .trim()
    .min(9, { message: "Enter a valid phone number" })
    .max(20, { message: "Phone number is too long" })
    .regex(/^[0-9+()\-\s]+$/, "Phone number contains invalid characters"),
  customerEmail: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.email().max(254).optional(),
  ),
  customerNote: z.string().trim().max(500).optional(),
  items: z.array(checkoutItemSchema).min(1),
  idempotencyKey: z.uuid(),
});

export const checkoutSchema = z.discriminatedUnion("fulfillmentMethod", [
  checkoutBaseSchema.extend({
    fulfillmentMethod: z.literal("PICKUP"),
  }),

  checkoutBaseSchema.extend({
    fulfillmentMethod: z.literal("DELIVERY"),
    deliveryAddressLine: z.string().trim().min(5).max(200),
    deliveryCity: z.string().trim().min(2).max(100),
    deliveryRegion: z.string().trim().max(100).optional(),
    deliveryDirections: z.string().trim().max(300).optional(),
  }),
]);

export type CheckoutInput = z.infer<typeof checkoutSchema>;
