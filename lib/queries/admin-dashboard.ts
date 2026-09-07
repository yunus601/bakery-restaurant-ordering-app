import "server-only";

import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

export async function getAdminDashboardSummary() {
  await requireAdmin();
  const now = new Date();

  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const [
    ordersToday,
    pendingOrders,
    revenueToday,
    availableProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({
      where: {
        createdAt: { gte: startOfToday },
      },
    }),
    prisma.order.count({
      where: {
        OR: [
          { status: "PLACED" },
          { status: "CONFIRMED" },
          { status: "PREPARING" },
        ],
      },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startOfToday,
        },
        paymentStatus: "PAID",
      },
      _sum: {
        totalPesewas: true,
      },
    }),

    prisma.product.count({
      where: { isAvailable: true, archivedAt: null },
    }),
    prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        fulfillmentMethod: true,
        status: true,
        totalPesewas: true,
        createdAt: true,
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);
  return {
    ordersToday,
    pendingOrders,
    revenueTodayPesewas: revenueToday._sum.totalPesewas ?? 0,
    availableProducts,
    recentOrders,
  };
}
