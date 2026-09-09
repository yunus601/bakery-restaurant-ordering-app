import { ClipboardList, Package, Truck } from "lucide-react";
import Link from "next/link";

import { formatPrice } from "@/lib/formatters";
import type { CustomerOrder } from "@/lib/queries/customer-orders";
import { OrderStatusBadge } from "./OrderStatusBadge";

const orderDateFormatter = new Intl.DateTimeFormat("en-GH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Accra",
});

export function CustomerOrdersList({ orders }: { orders: CustomerOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border bg-white px-6 py-16 text-center shadow-sm">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand/10 text-brand">
          <ClipboardList className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-navigation text-xl font-semibold">
          No orders yet
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-bakery-muted">
          Once you place an order, you can track its progress and review its
          details here.
        </p>
        <Link
          href="/menu"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand px-5 font-navigation text-sm font-semibold text-white transition hover:bg-brand/90"
        >
          Explore the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="group block rounded-2xl border bg-white p-5 shadow-sm transition hover:border-brand/40 hover:shadow-md sm:p-6"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-navigation text-lg font-semibold text-brand">
                  {order.orderNumber}
                </h2>
                <OrderStatusBadge status={order.status} />
              </div>
              <time
                dateTime={order.createdAt.toISOString()}
                className="mt-2 block text-sm text-bakery-muted"
              >
                Ordered {orderDateFormatter.format(order.createdAt)}
              </time>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-bakery-muted">
                <span className="inline-flex items-center gap-2 capitalize">
                  {order.fulfillmentMethod === "DELIVERY" ? (
                    <Truck className="size-4" aria-hidden="true" />
                  ) : (
                    <Package className="size-4" aria-hidden="true" />
                  )}
                  {order.fulfillmentMethod.toLowerCase()}
                </span>
                <span>
                  {order._count.items} {order._count.items === 1 ? "item" : "items"}
                </span>
                <span className="capitalize">
                  Payment: {order.paymentStatus.toLowerCase()}
                </span>
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-bakery-muted">
                Total
              </p>
              <p className="mt-1 font-navigation text-xl font-bold">
                {formatPrice(order.totalPesewas)}
              </p>
              <span className="mt-3 inline-block text-sm font-semibold text-brand group-hover:underline">
                View details
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
