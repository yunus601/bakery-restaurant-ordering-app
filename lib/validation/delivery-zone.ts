import { z } from "zod";

export const deliveryZoneSchema = z.object({
  name: z.string().trim().min(2).max(100),
  deliveryFeePesewas: z.number().int().nonnegative().max(10_000_000),
  minimumOrderPesewas: z.number().int().nonnegative().max(100_000_000).nullable(),
  isActive: z.boolean(),
  sortOrder: z.number().int().min(0).max(10_000),
});

export type DeliveryZoneInput = z.infer<typeof deliveryZoneSchema>;
