import "server-only";

import type { OrderStatus, Prisma } from "@/lib/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;
const actionableStatuses: OrderStatus[] = [
  "PLACED",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
];

type GetAdminOrdersInput = {
  page: number;
  status?: OrderStatus;
  search?: string;
};

export async function getAdminOrders({
  page,
  status,
  search,
}: GetAdminOrdersInput) {
  await requireAdmin();

  const safePage = Math.max(1, page);
  const normalizedSearch = search?.trim();

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(normalizedSearch
      ? {
          OR: [
            {
              orderNumber: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
            {
              customerName: { contains: normalizedSearch, mode: "insensitive" },
            },
            {
              customerPhone: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const [orders, totalItems, actionableStatusCounts] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (safePage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerPhone: true,
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
    prisma.order.groupBy({
      by: ["status"],
      where: {
        status: { in: actionableStatuses },
      },
      _count: { _all: true },
    }),
  ]);

  const actionableCounts = Object.fromEntries(
    actionableStatuses.map((orderStatus) => [orderStatus, 0]),
  ) as Record<(typeof actionableStatuses)[number], number>;

  for (const count of actionableStatusCounts) {
    actionableCounts[count.status] = count._count._all;
  }

  return {
    orders,
    actionableCounts,
    pagination: {
      page: safePage,
      pageSize: PAGE_SIZE,
      totalItems,
      totalPages: Math.ceil(totalItems / PAGE_SIZE),
    },
  };
}

export async function getAdminOrderById(orderId: string) {
  await requireAdmin();

  return prisma.order.findUnique({
    where: {
      id: orderId,
    },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      customerNote: true,
      cancellationReason: true,
      fulfillmentMethod: true,
      paymentMethod: true,
      paymentStatus: true,
      status: true,
      deliveryAddressLine: true,
      deliveryCity: true,
      deliveryRegion: true,
      deliveryDirections: true,
      deliveryZoneName: true,
      subtotalPesewas: true,
      deliveryFeePesewas: true,
      totalPesewas: true,
      confirmedAt: true,
      completedAt: true,
      cancelledAt: true,
      paidAt: true,
      refundedAt: true,
      createdAt: true,
      updatedAt: true,
      items: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          productId: true,
          productNameSnapshot: true,
          imageUrlSnapshot: true,
          unitPricePesewas: true,
          quantity: true,
          lineTotalPesewas: true,
        },
      },
      events: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          type: true,
          fromValue: true,
          toValue: true,
          reason: true,
          createdAt: true,
          actor: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  });
}
