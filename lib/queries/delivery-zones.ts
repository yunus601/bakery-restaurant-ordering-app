import "server-only";

import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

const zoneSelect = {
  id: true,
  name: true,
  deliveryFeePesewas: true,
  minimumOrderPesewas: true,
  isActive: true,
  sortOrder: true,
} as const;

export async function getActiveDeliveryZones() {
  return prisma.deliveryZone.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      deliveryFeePesewas: true,
      minimumOrderPesewas: true,
    },
  });
}

export async function getAdminDeliveryZones() {
  await requireAdmin();
  return prisma.deliveryZone.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: zoneSelect,
  });
}

export async function getAdminDeliveryZoneById(id: string) {
  await requireAdmin();
  return prisma.deliveryZone.findUnique({ where: { id }, select: zoneSelect });
}

export type AdminDeliveryZone = Awaited<
  ReturnType<typeof getAdminDeliveryZones>
>[number];
