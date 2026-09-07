import "server-only";

import prisma from "@/lib/prisma";
import type { CheckoutInput } from "@/lib/validation/order";
import { OrderError } from "../errors/order";

export async function createOrder(input: CheckoutInput) {
  const productIds = input.items.map((item) => item.productId);
  const uniqueProductIds = [...new Set(productIds)];

  if (uniqueProductIds.length !== productIds.length) {
    throw new OrderError("Duplicate products are not allowed.");
  }

  return prisma.$transaction(
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
        },
      });

      if (existingOrder) {
        return existingOrder;
      }
      const products = await tx.product.findMany({
        where: {
          id: {
            in: uniqueProductIds,
          },
          isAvailable: true,
          archivedAt: null,
          category: {
            isActive: true,
          },
        },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          pricePesewas: true,
        },
      });

      if (products.length !== uniqueProductIds.length) {
        throw new OrderError(
          "One or more products are unavailable. Please review your cart.",
        );
      }

      const productsById = new Map(
        products.map((product) => [product.id, product]),
      );

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
          pickupEnabled: true,
          deliveryEnabled: true,
          flatDeliveryFeePesewas: true,
          minimumOrderPesewas: true,
        },
      });

      if (!settings) {
        throw new OrderError("Ordering is temporarily unavailable.");
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

      const deliveryFeePesewas =
        input.fulfillmentMethod === "DELIVERY"
          ? settings.flatDeliveryFeePesewas
          : 0;

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
        },
      });
      return order;
    },
    {
      isolationLevel: "Serializable",
      maxWait: 10_000,
      timeout: 15_000,
    },
  );
}
