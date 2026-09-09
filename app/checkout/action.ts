"use server";

import { auth } from "@clerk/nextjs/server";

import { requireUser } from "@/lib/auth/require-user";
import { OrderError } from "@/lib/errors/order";
import { prisma } from "@/lib/prisma";
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
  linkedToAccount?: boolean;
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
    const { userId: clerkUserId } = await auth();
    const user = clerkUserId ? await requireUser() : null;
    const order = await createOrder(result.data, user?.id ?? null);

    if (user && !user.phone) {
      try {
        await prisma.user.updateMany({
          where: {
            id: user.id,
            phone: null,
          },
          data: {
            phone: result.data.customerPhone,
          },
        });
      } catch (error) {
        console.error("Customer phone update failed:", error);
      }
    }

    return {
      success: true,
      message: "Your order has been placed successfully.",
      order,
      linkedToAccount: Boolean(user),
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
