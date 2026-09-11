import "server-only";

import { NotificationStatus, NotificationType, Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const resendUrl = "https://api.resend.com/emails";

export async function enqueueOrderNotification(
  tx: Prisma.TransactionClient,
  input: { orderId: string; type: NotificationType; recipientEmail: string | null | undefined; recipientName: string },
) {
  if (!input.recipientEmail) return;
  await tx.notificationOutbox.createMany({
    data: { ...input, recipientEmail: input.recipientEmail },
    skipDuplicates: true,
  });
}

export function notificationTypeForStatus(status: string) {
  const types: Partial<Record<string, NotificationType>> = {
    CONFIRMED: "ORDER_CONFIRMED",
    READY: "ORDER_READY",
    OUT_FOR_DELIVERY: "ORDER_OUT_FOR_DELIVERY",
    COMPLETED: "ORDER_COMPLETED",
    CANCELLED: "ORDER_CANCELLED",
  };
  return types[status];
}

export async function deliverPendingOrderNotifications(limit = 25) {
  const now = new Date();
  const pending = await prisma.notificationOutbox.findMany({
    where: { status: { in: [NotificationStatus.PENDING, NotificationStatus.FAILED] }, availableAt: { lte: now } },
    orderBy: { createdAt: "asc" }, take: limit,
    include: { order: { select: { orderNumber: true, fulfillmentMethod: true } } },
  });
  let sent = 0;
  for (const notification of pending) {
    const claimed = await prisma.notificationOutbox.updateMany({
      where: { id: notification.id, status: { in: [NotificationStatus.PENDING, NotificationStatus.FAILED] } },
      data: { status: NotificationStatus.SENDING, attempts: { increment: 1 } },
    });
    if (claimed.count !== 1) continue;
    try {
      await sendEmail(notification);
      await prisma.notificationOutbox.update({ where: { id: notification.id }, data: { status: NotificationStatus.SENT, sentAt: new Date(), lastError: null } });
      sent++;
    } catch (error) {
      const attempts = notification.attempts + 1;
      await prisma.notificationOutbox.update({ where: { id: notification.id }, data: { status: NotificationStatus.FAILED, lastError: error instanceof Error ? error.message.slice(0, 1000) : "Unknown delivery error", availableAt: new Date(Date.now() + Math.min(60 * 60_000, 60_000 * 2 ** Math.min(attempts, 6))) } });
    }
  }
  return { processed: pending.length, sent };
}

async function sendEmail(notification: { recipientEmail: string; recipientName: string | null; type: NotificationType; order: { orderNumber: string; fulfillmentMethod: string } }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATION_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Email delivery is not configured.");
  const subject = subjectFor(notification.type, notification.order.orderNumber);
  const response = await fetch(resendUrl, { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [notification.recipientEmail], subject, text: `${notification.recipientName ?? "Hello"},\n\n${bodyFor(notification.type, notification.order.orderNumber, notification.order.fulfillmentMethod)}` }) });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}: ${(await response.text()).slice(0, 300)}`);
}

function subjectFor(type: NotificationType, orderNumber: string) { return `${orderNumber}: ${type.replace("ORDER_", "").replaceAll("_", " ").toLowerCase()}`; }
function bodyFor(type: NotificationType, orderNumber: string, fulfillment: string) {
  const messages: Record<NotificationType, string> = { ORDER_RECEIVED: "We received your order and will update you soon.", ORDER_CONFIRMED: "Your order has been confirmed and will be prepared shortly.", ORDER_READY: "Your order is ready for collection.", ORDER_OUT_FOR_DELIVERY: "Your order is on its way.", ORDER_COMPLETED: "Your order is complete. Thank you for choosing Confirm Bakery.", ORDER_CANCELLED: "Your order has been cancelled." };
  return `${messages[type]}\n\nOrder: ${orderNumber}\nFulfilment: ${fulfillment.toLowerCase()}`;
}
