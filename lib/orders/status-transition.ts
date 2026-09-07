import type {
  FulfillmentMethod,
  OrderStatus,
} from "@/lib/generated/prisma/client";

export function getAllowedOrderStatuses(
  currentStatus: OrderStatus,
  fulfillmentMethod: FulfillmentMethod,
): OrderStatus[] {
  switch (currentStatus) {
    case "PLACED":
      return ["CONFIRMED", "CANCELLED"];

    case "CONFIRMED":
      return ["PREPARING", "CANCELLED"];

    case "PREPARING":
      return ["READY", "CANCELLED"];

    case "READY":
      return fulfillmentMethod === "DELIVERY"
        ? ["OUT_FOR_DELIVERY", "CANCELLED"]
        : ["COMPLETED", "CANCELLED"];

    case "OUT_FOR_DELIVERY":
      return ["COMPLETED", "CANCELLED"];

    case "COMPLETED":
    case "CANCELLED":
      return [];

    default: {
      const unhandledStatus: never = currentStatus;
      return unhandledStatus;
    }
  }
}

export function canTransitionOrderStatus(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
  fulfillmentMethod: FulfillmentMethod,
) {
  return getAllowedOrderStatuses(currentStatus, fulfillmentMethod).includes(
    nextStatus,
  );
}
