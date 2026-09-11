"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import {
  deliveryZoneSchema,
  type DeliveryZoneInput,
} from "@/lib/validation/delivery-zone";

export type DeliveryZoneActionState = {
  success: boolean;
  message?: string;
  errors?: Partial<Record<keyof DeliveryZoneInput, string[]>>;
};

export async function createDeliveryZoneAction(
  _previousState: DeliveryZoneActionState,
  formData: FormData,
): Promise<DeliveryZoneActionState> {
  await requireAdmin();
  const result = deliveryZoneSchema.safeParse(readZoneForm(formData));
  if (!result.success) return validationFailure(result.error.flatten().fieldErrors);

  try {
    const duplicate = await prisma.deliveryZone.findFirst({
      where: { name: { equals: result.data.name, mode: "insensitive" } },
      select: { id: true },
    });
    if (duplicate) return { success: false, message: "A delivery zone with this name already exists.", errors: { name: ["Use a unique zone name."] } };

    await prisma.deliveryZone.create({ data: result.data });
    revalidateDeliveryZones();
    return { success: true, message: "Delivery zone created." };
  } catch (error) {
    console.error("Delivery zone creation failed:", error);
    return { success: false, message: "We could not create the delivery zone." };
  }
}

export async function updateDeliveryZoneAction(
  _previousState: DeliveryZoneActionState,
  formData: FormData,
): Promise<DeliveryZoneActionState> {
  await requireAdmin();
  const zoneId = formData.get("zoneId");
  if (typeof zoneId !== "string" || !zoneId) return { success: false, message: "A valid delivery zone is required." };

  const result = deliveryZoneSchema.safeParse(readZoneForm(formData));
  if (!result.success) return validationFailure(result.error.flatten().fieldErrors);

  try {
    const duplicate = await prisma.deliveryZone.findFirst({
      where: { id: { not: zoneId }, name: { equals: result.data.name, mode: "insensitive" } },
      select: { id: true },
    });
    if (duplicate) return { success: false, message: "A delivery zone with this name already exists.", errors: { name: ["Use a unique zone name."] } };

    const updated = await prisma.deliveryZone.updateMany({ where: { id: zoneId }, data: result.data });
    if (updated.count !== 1) return { success: false, message: "This delivery zone no longer exists." };
    revalidateDeliveryZones();
    return { success: true, message: "Delivery zone updated." };
  } catch (error) {
    console.error("Delivery zone update failed:", error);
    return { success: false, message: "We could not update the delivery zone." };
  }
}

export async function moveDeliveryZoneAction(zoneId: string, direction: "up" | "down") {
  await requireAdmin();
  if (!zoneId || (direction !== "up" && direction !== "down")) return;

  const zones = await prisma.deliveryZone.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true },
  });
  const index = zones.findIndex((zone) => zone.id === zoneId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapIndex < 0 || swapIndex >= zones.length) return;

  await prisma.$transaction([
    prisma.deliveryZone.update({ where: { id: zones[index].id }, data: { sortOrder: swapIndex } }),
    prisma.deliveryZone.update({ where: { id: zones[swapIndex].id }, data: { sortOrder: index } }),
  ]);
  revalidateDeliveryZones();
}

function readZoneForm(formData: FormData) {
  const minimumOrder = String(formData.get("minimumOrderGhs") ?? "").trim();
  return {
    name: formData.get("name"),
    deliveryFeePesewas: Math.round(Number(formData.get("deliveryFeeGhs")) * 100),
    minimumOrderPesewas: minimumOrder ? Math.round(Number(minimumOrder) * 100) : null,
    isActive: formData.get("isActive") === "on",
    sortOrder: Number(formData.get("sortOrder")),
  };
}

function validationFailure(errors: Partial<Record<keyof DeliveryZoneInput, string[]>>) {
  return { success: false, message: "Please correct the highlighted fields.", errors };
}

function revalidateDeliveryZones() {
  revalidatePath("/admin/delivery-zones");
  revalidatePath("/checkout");
}
