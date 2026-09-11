import "server-only";

import prisma from "@/lib/prisma";
import { enqueueOrderNotification } from "@/lib/notifications/outbox";
import { NotificationType } from "@/lib/generated/prisma/client";
import type { CheckoutInput } from "@/lib/validation/order";
import { OrderError, type OrderItemIssue } from "../errors/order";

export async function createOrder(
  input: CheckoutInput,
  userId: string | null = null,
) {
  const productIds = input.items.map((item) => item.productId);
  const uniqueProductIds = [...new Set(productIds)];

  if (uniqueProductIds.length !== productIds.length) {
    throw new OrderError("Duplicate products are not allowed.");
  }

  try {
    return await prisma.$transaction(
      async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: {
          idempotencyKey: input.idempotencyKey,
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalPesewas: true,
          userId: true,
        },
      });

      if (existingOrder) {
        if (existingOrder.userId !== userId) {
          throw new OrderError("This checkout session is no longer valid.");
        }
        return existingOrder;
      }
      const products = await tx.product.findMany({
        where: {
          id: {
            in: uniqueProductIds,
          },
        },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          pricePesewas: true,
          isAvailable: true,
          archivedAt: true,
          category: {
            select: { isActive: true },
          },
        },
      });

      const productsById = new Map(
        products.map((product) => [product.id, product]),
      );

      const itemIssues = input.items.flatMap<OrderItemIssue>((item) => {
        const product = productsById.get(item.productId);

        if (
          !product ||
          !product.isAvailable ||
          product.archivedAt ||
          !product.category.isActive
        ) {
          return [
            {
              productId: item.productId,
              productName: product?.name ?? "An item in your cart",
              reason: "unavailable" as const,
            },
          ];
        }

        if (product.pricePesewas !== item.clientUnitPricePesewas) {
          return [
            {
              productId: item.productId,
              productName: product.name,
              reason: "price_changed" as const,
              previousPricePesewas: item.clientUnitPricePesewas,
              currentPricePesewas: product.pricePesewas,
            },
          ];
        }

        return [];
      });

      if (itemIssues.length > 0) {
        throw new OrderError(
          "Your cart changed while you were ordering. Review the items below, then submit again.",
          itemIssues,
        );
      }

      const orderItems = input.items.map((item) => {
        const product = productsById.get(item.productId);

        if (!product) {
          throw new OrderError("A product could not be verified.");
        }

        return {
          productId: product.id,
          productNameSnapshot: product.name,
          imageUrlSnapshot: product.imageUrl,
          unitPricePesewas: product.pricePesewas,
          quantity: item.quantity,
          lineTotalPesewas: product.pricePesewas * item.quantity,
        };
      });

      const settings = await tx.restaurantSettings.findUnique({
        where: {
          id: "default",
        },
        select: {
          acceptingOrders: true,
          pickupEnabled: true,
          deliveryEnabled: true,
          minimumOrderPesewas: true,
        },
      });

      if (!settings) {
        throw new OrderError("Ordering is temporarily unavailable.");
      }

      if (!settings.acceptingOrders) {
        throw new OrderError(
          "We are not accepting new orders right now. Please check back during opening hours.",
        );
      }

      if (input.fulfillmentMethod === "PICKUP" && !settings.pickupEnabled) {
        throw new OrderError("Pickup is currently unavailable.");
      }

      if (input.fulfillmentMethod === "DELIVERY" && !settings.deliveryEnabled) {
        throw new OrderError("Delivery is currently unavailable.");
      }

      const subtotalPesewas = orderItems.reduce(
        (total, item) => total + item.lineTotalPesewas,
        0,
      );

      if (subtotalPesewas < settings.minimumOrderPesewas) {
        throw new OrderError(
          "Your order does not meet the minimum order amount.",
        );
      }

      const deliveryZone =
        input.fulfillmentMethod === "DELIVERY"
          ? await tx.deliveryZone.findFirst({
              where: { id: input.deliveryZoneId, isActive: true },
              select: {
                name: true,
                deliveryFeePesewas: true,
                minimumOrderPesewas: true,
              },
            })
          : null;

      if (input.fulfillmentMethod === "DELIVERY" && !deliveryZone) {
        throw new OrderError(
          "The selected delivery zone is no longer available. Choose another zone.",
        );
      }

      if (
        deliveryZone?.minimumOrderPesewas != null &&
        subtotalPesewas < deliveryZone.minimumOrderPesewas
      ) {
        throw new OrderError(
          `${deliveryZone.name} requires a minimum order of ${formatGhs(deliveryZone.minimumOrderPesewas)}.`,
        );
      }

      const deliveryFeePesewas = deliveryZone?.deliveryFeePesewas ?? 0;

      const totalPesewas = subtotalPesewas + deliveryFeePesewas;
      const paymentMethod =
        input.fulfillmentMethod === "PICKUP"
          ? "PAY_ON_PICKUP"
          : "CASH_ON_DELIVERY";

      const orderNumber = `CB-${new Date()
        .toISOString()
        .slice(0, 10)
        .replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

      const order = await tx.order.create({
        data: {
          idempotencyKey: input.idempotencyKey,
          orderNumber,
          userId,

          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerEmail: input.customerEmail,

          fulfillmentMethod: input.fulfillmentMethod,
          paymentMethod,

          deliveryAddressLine:
            input.fulfillmentMethod === "DELIVERY"
              ? input.deliveryAddressLine
              : null,

          deliveryCity:
            input.fulfillmentMethod === "DELIVERY" ? input.deliveryCity : null,

          deliveryRegion:
            input.fulfillmentMethod === "DELIVERY"
              ? input.deliveryRegion
              : null,

          deliveryDirections:
            input.fulfillmentMethod === "DELIVERY"
              ? input.deliveryDirections
              : null,

          deliveryZoneName: deliveryZone?.name ?? null,

          customerNote: input.customerNote,

          subtotalPesewas,
          deliveryFeePesewas,
          totalPesewas,

          items: {
            create: orderItems,
          },
        },

        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalPesewas: true,
          userId: true,
        },
      });
      await enqueueOrderNotification(tx, {
        orderId: order.id,
        type: NotificationType.ORDER_RECEIVED,
        recipientEmail: input.customerEmail,
        recipientName: input.customerName,
      });
      return order;
      },
      {
        isolationLevel: "Serializable",
        maxWait: 10_000,
        timeout: 15_000,
      },
    );
  } catch (error) {
    if (error instanceof OrderError) throw error;

    // A simultaneous retry may lose the unique-key race after both requests
    // checked for an existing order. Returning the committed order makes the
    // idempotency guarantee hold even for concurrent submissions.
    const existingOrder = await prisma.order.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalPesewas: true,
        userId: true,
      },
    });

    if (existingOrder?.userId === userId) return existingOrder;
    throw error;
  }
}

function formatGhs(pesewas: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(pesewas / 100);
}
