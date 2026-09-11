import { z } from "zod";

export const storeSettingsSchema = z
  .object({
    contactPhone: z.string().trim().min(9).max(30),
    contactEmail: z.email().max(254),
    pickupAddress: z.string().trim().min(5).max(300),
    openingHours: z.string().trim().min(3).max(500),
    acceptingOrders: z.boolean(),
    pickupEnabled: z.boolean(),
    deliveryEnabled: z.boolean(),
    pickupPreparationMinMinutes: z.number().int().min(0).max(1440),
    pickupPreparationMaxMinutes: z.number().int().min(0).max(1440),
    flatDeliveryFeePesewas: z.number().int().nonnegative().max(10_000_000),
  })
  .refine(
    (settings) =>
      settings.pickupPreparationMaxMinutes >=
      settings.pickupPreparationMinMinutes,
    {
      path: ["pickupPreparationMaxMinutes"],
      message: "Maximum preparation time must be at least the minimum.",
    },
  )
  .refine((settings) => settings.pickupEnabled || settings.deliveryEnabled, {
    path: ["deliveryEnabled"],
    message: "Keep at least one fulfilment method enabled.",
  });

export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;
