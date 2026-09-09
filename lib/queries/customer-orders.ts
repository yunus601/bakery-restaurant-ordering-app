import "server-only";

import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/prisma";

const pageSize = 10;

export async function getCustomerOrders(pageValue?: string) {
  const user = await requireUser();

  const parsedPage = Number(pageValue);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const where = {
    userId: user.id,
  };

  const [orders, totalItems] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        orderNumber: true,
        fulfillmentMethod: true,
        paymentMethod: true,
        paymentStatus: true,
        status: true,
        totalPesewas: true,
        createdAt: true,
        _count: {
          select: {
            items: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    },
  };
}

export async function getCustomerOrderById(orderId: string) {
  const user = await requireUser();

  return prisma.order.findFirst({
    where: {
      id: orderId,
      userId: user.id,
    },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      customerNote: true,
      fulfillmentMethod: true,
      paymentMethod: true,
      paymentStatus: true,
      status: true,
      deliveryAddressLine: true,
      deliveryCity: true,
      deliveryRegion: true,
      deliveryDirections: true,
      subtotalPesewas: true,
      deliveryFeePesewas: true,
      totalPesewas: true,
      confirmedAt: true,
      completedAt: true,
      cancelledAt: true,
      paidAt: true,
      refundedAt: true,
      createdAt: true,
      items: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          productNameSnapshot: true,
          imageUrlSnapshot: true,
          unitPricePesewas: true,
          quantity: true,
          lineTotalPesewas: true,
        },
      },
    },
  });
}

export type CustomerOrder = Awaited<
  ReturnType<typeof getCustomerOrders>
>["orders"][number];

export type CustomerOrderDetails = NonNullable<
  Awaited<ReturnType<typeof getCustomerOrderById>>
>;
