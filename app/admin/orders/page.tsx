import { ClipboardList, TriangleAlert } from "lucide-react";
import Link from "next/link";

import { AdminOrderRefresh } from "@/components/admin/orders/AdminOrderRefresh";
import { OrderFilters } from "@/components/admin/orders/OrderFilters";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { OrderStatus } from "@/lib/generated/prisma/client";
import { formatPrice } from "@/lib/formatters";
import { getAdminOrders } from "@/lib/queries/admin-orders";
import { getStoreSettings } from "@/lib/queries/store-settings";
import { cn } from "@/lib/utils";

const orderStatuses = [
  "PLACED",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED",
] as const satisfies readonly OrderStatus[];

const statusStyles: Record<OrderStatus, string> = {
  PLACED: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-violet-100 text-violet-800",
  READY: "bg-emerald-100 text-emerald-800",
  OUT_FOR_DELIVERY: "bg-cyan-100 text-cyan-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const dateFormatter = new Intl.DateTimeFormat("en-GH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Accra",
});

type OrdersPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    status?: string | string[];
    q?: string | string[];
  }>;
};

export default async function AdminOrdersPage({
  searchParams,
}: OrdersPageProps) {
  const params = await searchParams;
  const pageValue = firstValue(params.page);
  const statusValue = firstValue(params.status);
  const search = firstValue(params.q)?.slice(0, 100);
  const parsedPage = Number.parseInt(pageValue ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const status = orderStatuses.includes(statusValue as OrderStatus)
    ? (statusValue as OrderStatus)
    : undefined;
  const [result, storeSettings] = await Promise.all([
    getAdminOrders({ page, status, search }),
    getStoreSettings(),
  ]);
  const visibleTotalPages = Math.max(1, result.pagination.totalPages);
  const overdueAfterMinutes = storeSettings.pickupPreparationMaxMinutes + 15;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <div>
        <p className="font-navigation text-sm font-semibold uppercase tracking-[0.18em] text-brand">
          Operations
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
          Orders
        </h1>
        <p className="mt-3 text-sm text-bakery-muted">
          Find and manage pickup and delivery orders.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-bakery-muted">
          Active orders become overdue after {overdueAfterMinutes} minutes.
        </p>
        <AdminOrderRefresh updatedAt={new Date()} />
      </div>

      <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5" aria-label="Actionable order counts">
        {actionableStatusSummaries.map(({ status: summaryStatus, label }) => (
          <Link
            key={summaryStatus}
            href={buildOrdersHref(1, undefined, summaryStatus)}
            className="rounded-xl border bg-white p-4 shadow-sm transition-colors hover:border-brand hover:bg-brand/5"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-bakery-muted">{label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-foreground">
              {result.actionableCounts[summaryStatus].toLocaleString("en-GH")}
            </p>
          </Link>
        ))}
      </section>

      <OrderFilters
        key={[search, status].join(":")}
        search={search}
        status={status}
        statuses={orderStatuses}
      />

      <section className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b px-5 py-4 sm:px-6">
          <p className="text-sm text-bakery-muted">
            <span className="font-semibold text-foreground">
              {result.pagination.totalItems.toLocaleString("en-GH")}
            </span>{" "}
            {result.pagination.totalItems === 1 ? "order" : "orders"}
          </p>
          <p className="text-sm text-bakery-muted">
            Page {result.pagination.page} of {visibleTotalPages}
          </p>
        </div>

        {result.orders.length === 0 ? (
          <div className="grid min-h-80 place-items-center px-6 py-12 text-center">
            <div>
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand/10 text-brand">
                <ClipboardList className="size-6" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-navigation font-semibold">
                No matching orders
              </h2>
              <p className="mt-2 max-w-sm text-sm text-bakery-muted">
                Try changing the search or status filter.
              </p>
            </div>
          </div>
        ) : (
          <>
          <div className="divide-y md:hidden">
            {result.orders.map((order) => {
              const isOverdue = isOrderOverdue(order.createdAt, order.status, overdueAfterMinutes);

              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className={cn(
                    "block px-5 py-5 transition-colors hover:bg-brand/5",
                    isOverdue && "bg-red-50/70",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-navigation font-semibold text-brand">{order.orderNumber}</p>
                      <p className="mt-1 text-xs text-bakery-muted">{dateFormatter.format(order.createdAt)}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-4 font-medium">{order.customerName}</p>
                  <p className="mt-1 text-sm text-bakery-muted">
                    {order._count.items} {order._count.items === 1 ? "item" : "items"} · {formatLabel(order.fulfillmentMethod)} · {formatPrice(order.totalPesewas)}
                  </p>
                  <OrderAttention status={order.status} isOverdue={isOverdue} />
                </Link>
              );
            })}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-220 text-left text-sm">
              <thead className="bg-[#faf7f4] text-xs uppercase tracking-wide text-bakery-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold sm:px-6">Order</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Fulfilment</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Items</th>
                  <th className="px-5 py-3 text-right font-semibold sm:px-6">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {result.orders.map((order) => {
                  const isOverdue = isOrderOverdue(order.createdAt, order.status, overdueAfterMinutes);

                  return (
                  <tr key={order.id} className={cn("transition-colors hover:bg-brand/5", isOverdue && "bg-red-50/70")}>
                    <td className="px-5 py-4 sm:px-6">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-navigation font-semibold text-brand underline-offset-4 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                      <time
                        dateTime={order.createdAt.toISOString()}
                        className="mt-1 block text-xs text-bakery-muted"
                      >
                        {dateFormatter.format(order.createdAt)}
                      </time>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium">{order.customerName}</p>
                      <p className="mt-1 text-xs text-bakery-muted">
                        {order.customerPhone}
                      </p>
                    </td>
                    <td className="px-5 py-4 capitalize text-bakery-muted">
                      {order.fulfillmentMethod.toLowerCase()}
                    </td>
                    <td className="px-5 py-4">
                      <p className="capitalize">
                        {formatStatus(order.paymentMethod)}
                      </p>
                      <p className="mt-1 text-xs text-bakery-muted">
                        {formatStatus(order.paymentStatus)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          statusStyles[order.status],
                        )}
                      >
                        {formatStatus(order.status)}
                      </span>
                      <OrderAttention status={order.status} isOverdue={isOverdue} />
                    </td>
                    <td className="px-5 py-4 text-bakery-muted">
                      {order._count.items}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold sm:px-6">
                      {formatPrice(order.totalPesewas)}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </section>

      {result.pagination.totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={buildOrdersHref(page - 1, search, status)}
                aria-disabled={page <= 1}
                tabIndex={page <= 1 ? -1 : undefined}
                className={cn(page <= 1 && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href={buildOrdersHref(page, search, status)}
                isActive
                aria-label={`Page ${page}`}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href={buildOrdersHref(page + 1, search, status)}
                aria-disabled={page >= result.pagination.totalPages}
                tabIndex={page >= result.pagination.totalPages ? -1 : undefined}
                className={cn(
                  page >= result.pagination.totalPages &&
                    "pointer-events-none opacity-50",
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

const actionableStatusSummaries = [
  { status: "PLACED", label: "New" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "PREPARING", label: "Preparing" },
  { status: "READY", label: "Ready" },
  { status: "OUT_FOR_DELIVERY", label: "Delivering" },
] as const satisfies readonly { status: OrderStatus; label: string }[];

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", statusStyles[status])}>
      {formatStatus(status)}
    </span>
  );
}

function OrderAttention({ status, isOverdue }: { status: OrderStatus; isOverdue: boolean }) {
  if (isOverdue) {
    return <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-700"><TriangleAlert className="size-3.5" aria-hidden="true" /> Overdue</p>;
  }
  if (status === "PLACED") {
    return <p className="mt-2 text-xs font-semibold text-amber-700">New order — needs acceptance</p>;
  }
  return null;
}

function isOrderOverdue(createdAt: Date, status: OrderStatus, overdueAfterMinutes: number) {
  return !["COMPLETED", "CANCELLED"].includes(status) && Date.now() - createdAt.getTime() > overdueAfterMinutes * 60_000;
}

function buildOrdersHref(page: number, search?: string, status?: OrderStatus) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (search) params.set("q", search);
  if (status) params.set("status", status);
  return `/admin/orders?${params.toString()}`;
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatStatus(value: string) {
  return value.toLowerCase().replaceAll("_", " ");
}

function formatLabel(value: string) {
  return formatStatus(value);
}
