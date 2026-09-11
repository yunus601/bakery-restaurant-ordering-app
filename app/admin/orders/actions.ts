"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/require-admin";
import { OrderStatus, PaymentStatus } from "@/lib/generated/prisma/client";
import { canTransitionPaymentStatus } from "@/lib/orders/payment-transition";
import { canTransitionOrderStatus } from "@/lib/orders/status-transition";
import { prisma } from "@/lib/prisma";
import { deliverPendingOrderNotifications, enqueueOrderNotification, notificationTypeForStatus } from "@/lib/notifications/outbox";

const updateOrderStatusSchema = z
  .object({
    orderId: z.string().min(1),
    nextStatus: z.enum(OrderStatus),
    cancellationReason: z.preprocess(
      (value) =>
        value === null || (typeof value === "string" && value.trim() === "")
          ? undefined
          : value,
      z.string().trim().min(3).max(500).optional(),
    ),
  })
  .superRefine((input, context) => {
    if (input.nextStatus === "CANCELLED" && !input.cancellationReason) {
      context.addIssue({
        code: "custom",
        path: ["cancellationReason"],
        message: "Enter a reason for cancelling this order.",
      });
    }
  });

const updatePaymentStatusSchema = z.object({
  orderId: z.string().min(1),
  nextStatus: z.enum(PaymentStatus),
});

export type UpdateOrderStatusState = {
  success: boolean;
  message?: string;
  errors?: {
    cancellationReason?: string[];
  };
};

export type UpdatePaymentStatusState = {
  success: boolean;
  message?: string;
};

export async function updateOrderStatusAction(
  _previousState: UpdateOrderStatusState,
  formData: FormData,
): Promise<UpdateOrderStatusState> {
  const admin = await requireAdmin();

  const parsed = updateOrderStatusSchema.safeParse({
    orderId: formData.get("orderId"),
    nextStatus: formData.get("nextStatus"),
    cancellationReason: formData.get("cancellationReason"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the status update.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { orderId, nextStatus, cancellationReason } = parsed.data;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        status: true,
        fulfillmentMethod: true,
        paymentStatus: true,
        customerEmail: true,
        customerName: true,
      },
    });

    if (!order) {
      return {
        success: false,
        message: "This order no longer exists.",
      };
    }

    if (
      !canTransitionOrderStatus(
        order.status,
        nextStatus,
        order.fulfillmentMethod,
      )
    ) {
      return {
        success: false,
        message: `This order cannot move from ${formatStatus(order.status)} to ${formatStatus(nextStatus)}.`,
      };
    }

    if (nextStatus === "COMPLETED" && order.paymentStatus !== "PAID") {
      return {
        success: false,
        message: "Mark the payment as paid before completing this order.",
      };
    }

    const now = new Date();
    const changed = await prisma.$transaction(async (tx) => {
      const updateResult = await tx.order.updateMany({
        where: {
          id: orderId,
          status: order.status,
          ...(nextStatus === "COMPLETED"
            ? { paymentStatus: "PAID" as const }
            : {}),
        },
        data: {
          status: nextStatus,
          confirmedAt: nextStatus === "CONFIRMED" ? now : undefined,
          completedAt: nextStatus === "COMPLETED" ? now : undefined,
          cancelledAt: nextStatus === "CANCELLED" ? now : undefined,
          cancellationReason:
            nextStatus === "CANCELLED" ? cancellationReason : undefined,
        },
      });

      if (updateResult.count !== 1) return false;

      await tx.orderEvent.create({
        data: {
          orderId,
          actorId: admin.id,
          type: "STATUS_CHANGED",
          fromValue: order.status,
          toValue: nextStatus,
          reason: nextStatus === "CANCELLED" ? cancellationReason : null,
        },
      });
      const notificationType = notificationTypeForStatus(nextStatus);
      if (notificationType) await enqueueOrderNotification(tx, { orderId, type: notificationType, recipientEmail: order.customerEmail, recipientName: order.customerName });

      return true;
    });

    if (!changed) {
      return {
        success: false,
        message:
          "This order was updated by someone else. Refresh the page and try again.",
      };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    deliverPendingOrderNotifications().catch((error) => console.error("Order notification delivery failed:", error));

    return {
      success: true,
      message: `Order moved to ${formatStatus(nextStatus)}.`,
    };
  } catch (error) {
    console.error("Order status update failed:", error);

    return {
      success: false,
      message: "We could not update the order. Please try again.",
    };
  }
}

export async function updatePaymentStatusAction(
  _previousState: UpdatePaymentStatusState,
  formData: FormData,
): Promise<UpdatePaymentStatusState> {
  const admin = await requireAdmin();

  const parsed = updatePaymentStatusSchema.safeParse({
    orderId: formData.get("orderId"),
    nextStatus: formData.get("nextStatus"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Select a valid payment status.",
    };
  }

  const { orderId, nextStatus } = parsed.data;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        paymentStatus: true,
        status: true,
      },
    });

    if (!order) {
      return {
        success: false,
        message: "This order no longer exists.",
      };
    }

    if (!canTransitionPaymentStatus(order.paymentStatus, nextStatus)) {
      return {
        success: false,
        message: `Payment cannot move from ${formatPaymentStatus(order.paymentStatus)} to ${formatPaymentStatus(nextStatus)}.`,
      };
    }

    if (nextStatus === "PAID" && order.status === "CANCELLED") {
      return {
        success: false,
        message: "A cancelled order cannot be marked as paid.",
      };
    }

    const now = new Date();
    const changed = await prisma.$transaction(async (tx) => {
      const updateResult = await tx.order.updateMany({
        where: {
          id: orderId,
          paymentStatus: order.paymentStatus,
        },
        data: {
          paymentStatus: nextStatus,
          paidAt: nextStatus === "PAID" ? now : undefined,
          refundedAt: nextStatus === "REFUNDED" ? now : undefined,
        },
      });

      if (updateResult.count !== 1) return false;

      await tx.orderEvent.create({
        data: {
          orderId,
          actorId: admin.id,
          type: "PAYMENT_STATUS_CHANGED",
          fromValue: order.paymentStatus,
          toValue: nextStatus,
        },
      });

      return true;
    });

    if (!changed) {
      return {
        success: false,
        message:
          "This payment was updated by someone else. Refresh the page and try again.",
      };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return {
      success: true,
      message: `Payment moved to ${formatPaymentStatus(nextStatus)}.`,
    };
  } catch (error) {
    console.error("Payment status update failed:", error);

    return {
      success: false,
      message: "We could not update the payment. Please try again.",
    };
  }
}

function formatStatus(status: OrderStatus) {
  return status.toLowerCase().replaceAll("_", " ");
}

function formatPaymentStatus(status: PaymentStatus) {
  return status.toLowerCase().replaceAll("_", " ");
}
