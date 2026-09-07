import type { PaymentStatus } from "@/lib/generated/prisma/client";

export function getAllowedPaymentStatuses(
  currentStatus: PaymentStatus,
): PaymentStatus[] {
  switch (currentStatus) {
    case "PENDING":
      return ["PAID"];

    case "PAID":
      return ["REFUNDED"];

    case "FAILED":
      return ["PENDING"];

    case "REFUNDED":
      return [];

    default: {
      const unhandledStatus: never = currentStatus;
      return unhandledStatus;
    }
  }
}

export function canTransitionPaymentStatus(
  currentStatus: PaymentStatus,
  nextStatus: PaymentStatus,
) {
  return getAllowedPaymentStatuses(currentStatus).includes(nextStatus);
}
