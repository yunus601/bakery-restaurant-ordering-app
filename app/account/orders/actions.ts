"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/prisma";
import { deliverPendingOrderNotifications, enqueueOrderNotification } from "@/lib/notifications/outbox";
import { NotificationType } from "@/lib/generated/prisma/client";
import { RateLimitError, enforceRateLimit } from "@/lib/security/rate-limit";

const cancelCustomerOrderSchema = z.object({
  orderId: z.string().trim().min(1),
  cancellationReason: z.preprocess(
    (value) =>
      value === null || (typeof value === "string" && value.trim() === "")
        ? undefined
        : value,
    z.string().trim().min(3).max(500).optional(),
  ),
});

export type CancelCustomerOrderState = {
  success: boolean;
  message?: string;
  errors?: { cancellationReason?: string[] };
};

export async function cancelCustomerOrderAction(
  _previousState: CancelCustomerOrderState,
  formData: FormData,
): Promise<CancelCustomerOrderState> {
  const user = await requireUser();
  try {
    await enforceRateLimit(`order-cancellation:${user.id}`, 5, 60_000);
  } catch (error) {
    if (error instanceof RateLimitError) return { success: false, message: "Too many cancellation attempts. Please wait a minute and try again." };
    throw error;
  }
  const parsed = cancelCustomerOrderSchema.safeParse({
    orderId: formData.get("orderId"),
    cancellationReason: formData.get("cancellationReason"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the cancellation reason.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const cancelled = await prisma.$transaction(
      async (tx) => {
        const settings = await tx.restaurantSettings.findUnique({
          where: { id: "default" },
          select: { customerCancellationEnabled: true },
        });

        if (!settings?.customerCancellationEnabled) return false;

        const eligibleOrder = await tx.order.findFirst({ where: { id: parsed.data.orderId, userId: user.id, status: "PLACED" }, select: { customerEmail: true, customerName: true } });
        if (!eligibleOrder) return false;
        const updated = await tx.order.updateMany({
          where: {
            id: parsed.data.orderId,
            userId: user.id,
            status: "PLACED",
          },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
            cancellationReason: parsed.data.cancellationReason ?? null,
          },
        });

        if (updated.count !== 1) return false;

        await tx.orderEvent.create({
          data: {
            orderId: parsed.data.orderId,
            actorId: user.id,
            type: "STATUS_CHANGED",
            fromValue: "PLACED",
            toValue: "CANCELLED",
            reason: parsed.data.cancellationReason ?? null,
          },
        });
        await enqueueOrderNotification(tx, { orderId: parsed.data.orderId, type: NotificationType.ORDER_CANCELLED, recipientEmail: eligibleOrder.customerEmail, recipientName: eligibleOrder.customerName });

        return true;
      },
      { isolationLevel: "Serializable", maxWait: 10_000, timeout: 15_000 },
    );

    if (!cancelled) {
      return {
        success: false,
        message:
          "This order can no longer be cancelled online. Please contact the bakery for help.",
      };
    }

    revalidatePath("/account/orders");
    revalidatePath(`/account/orders/${parsed.data.orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${parsed.data.orderId}`);
    deliverPendingOrderNotifications().catch((error) => console.error("Order notification delivery failed:", error));

    return { success: true, message: "Your order has been cancelled." };
  } catch (error) {
    console.error("Customer order cancellation failed:", error);
    return {
      success: false,
      message: "We could not cancel your order. Please try again or contact the bakery.",
    };
  }
}
