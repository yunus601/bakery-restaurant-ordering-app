"use server";

import { OrderError } from "@/lib/errors/order";
import { createOrder } from "@/lib/services/order";
import { checkoutSchema } from "@/lib/validation/order";

export type CheckoutActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    totalPesewas: number;
  };
};

function parseItems(value: FormDataEntryValue | null): unknown {
  if (typeof value !== "string") {
    return [];
  }

  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

export async function createOrderAction(
  _previousState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const input = {
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    customerEmail: formData.get("customerEmail"),
    customerNote: formData.get("customerNote"),

    fulfillmentMethod: formData.get("fulfillmentMethod"),

    deliveryAddressLine: formData.get("deliveryAddressLine"),
    deliveryCity: formData.get("deliveryCity"),
    deliveryRegion: formData.get("deliveryRegion"),
    deliveryDirections: formData.get("deliveryDirections"),

    items: parseItems(formData.get("items")),
    idempotencyKey: formData.get("idempotencyKey"),
  };
  const result = checkoutSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors: result.error.flatten().fieldErrors,
    };
  }
  try {
    const order = await createOrder(result.data);

    return {
      success: true,
      message: "Your order has been placed successfully.",
      order,
    };
  } catch (error) {
    if (error instanceof OrderError) {
      return {
        success: false,
        message: error.message,
      };
    }

    console.error("Unexpected order creation failure:", error);

    return {
      success: false,
      message: "We could not place your order. Please try again.",
    };
  }
}
