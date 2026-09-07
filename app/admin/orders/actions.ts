"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/require-admin";
import { OrderStatus, PaymentStatus } from "@/lib/generated/prisma/client";
import { canTransitionPaymentStatus } from "@/lib/orders/payment-transition";
import { canTransitionOrderStatus } from "@/lib/orders/status-transition";
import { prisma } from "@/lib/prisma";

const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  nextStatus: z.enum(OrderStatus),
});

const updatePaymentStatusSchema = z.object({
  orderId: z.string().min(1),
  nextStatus: z.enum(PaymentStatus),
});

export type UpdateOrderStatusState = {
  success: boolean;
  message?: string;
};

export type UpdatePaymentStatusState = {
  success: boolean;
  message?: string;
};

export async function updateOrderStatusAction(
  _previousState: UpdateOrderStatusState,
  formData: FormData,
): Promise<UpdateOrderStatusState> {
  await requireAdmin();

  const parsed = updateOrderStatusSchema.safeParse({
    orderId: formData.get("orderId"),
    nextStatus: formData.get("nextStatus"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Select a valid order status.",
    };
  }

  const { orderId, nextStatus } = parsed.data;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        status: true,
        fulfillmentMethod: true,
        paymentStatus: true,
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
    const updateResult = await prisma.order.updateMany({
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
      },
    });

    if (updateResult.count !== 1) {
      return {
        success: false,
        message:
          "This order was updated by someone else. Refresh the page and try again.",
      };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

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
  await requireAdmin();

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
    const updateResult = await prisma.order.updateMany({
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

    if (updateResult.count !== 1) {
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
