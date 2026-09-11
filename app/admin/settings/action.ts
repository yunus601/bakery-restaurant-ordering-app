"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import {
  storeSettingsSchema,
  type StoreSettingsInput,
} from "@/lib/validation/store-settings";

export type StoreSettingsActionState = {
  success: boolean;
  message?: string;
  errors?: Partial<Record<keyof StoreSettingsInput, string[]>>;
};

export async function updateStoreSettingsAction(
  _previousState: StoreSettingsActionState,
  formData: FormData,
): Promise<StoreSettingsActionState> {
  await requireAdmin();

  const result = storeSettingsSchema.safeParse({
    contactPhone: formData.get("contactPhone"),
    contactEmail: formData.get("contactEmail"),
    pickupAddress: formData.get("pickupAddress"),
    openingHours: formData.get("openingHours"),
    acceptingOrders: formData.get("acceptingOrders") === "on",
    customerCancellationEnabled:
      formData.get("customerCancellationEnabled") === "on",
    pickupEnabled: formData.get("pickupEnabled") === "on",
    deliveryEnabled: formData.get("deliveryEnabled") === "on",
    pickupPreparationMinMinutes: Number(
      formData.get("pickupPreparationMinMinutes"),
    ),
    pickupPreparationMaxMinutes: Number(
      formData.get("pickupPreparationMaxMinutes"),
    ),
    flatDeliveryFeePesewas: Math.round(
      Number(formData.get("deliveryFeeGhs")) * 100,
    ),
  });

  if (!result.success) {
    return {
      success: false,
      message: "Please correct the highlighted settings.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.restaurantSettings.update({
      where: { id: "default" },
      data: result.data,
    });

    revalidatePath("/", "layout");

    return { success: true, message: "Store settings saved successfully." };
  } catch (error) {
    console.error("Store settings update failed:", error);
    return {
      success: false,
      message: "We could not save the store settings. Please try again.",
    };
  }
}
