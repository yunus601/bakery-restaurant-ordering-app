import "server-only";

import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

const settingsSelect = {
  contactPhone: true,
  contactEmail: true,
  pickupAddress: true,
  openingHours: true,
  acceptingOrders: true,
  customerCancellationEnabled: true,
  pickupEnabled: true,
  deliveryEnabled: true,
  pickupPreparationMinMinutes: true,
  pickupPreparationMaxMinutes: true,
  flatDeliveryFeePesewas: true,
} as const;

export async function getStoreSettings() {
  return prisma.restaurantSettings.findUniqueOrThrow({
    where: { id: "default" },
    select: settingsSelect,
  });
}

export async function getAdminStoreSettings() {
  await requireAdmin();
  return getStoreSettings();
}

export type StoreSettings = Awaited<ReturnType<typeof getStoreSettings>>;
