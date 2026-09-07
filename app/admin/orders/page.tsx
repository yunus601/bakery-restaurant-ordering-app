import { ClipboardList, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

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
  const result = await getAdminOrders({ page, status, search });
  const visibleTotalPages = Math.max(1, result.pagination.totalPages);

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

      <form
        action="/admin/orders"
        className="mt-8 grid gap-3 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_13rem_auto]"
      >
        <label className="relative">
          <span className="sr-only">Search orders</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-bakery-muted"
            aria-hidden="true"
          />
          <input
            name="q"
            type="search"
            defaultValue={search}
            placeholder="Order number, customer, or phone"
            className="h-11 w-full rounded-xl border bg-background pl-10 pr-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </label>

        <label className="relative">
          <span className="sr-only">Filter by status</span>
          <SlidersHorizontal
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-bakery-muted"
            aria-hidden="true"
          />
          <select
            name="status"
            defaultValue={status ?? ""}
            className="h-11 w-full cursor-pointer appearance-none rounded-xl border bg-background pl-10 pr-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
          >
            <option value="">All statuses</option>
            {orderStatuses.map((value) => (
              <option key={value} value={value}>
                {formatStatus(value)}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            className="h-11 flex-1 cursor-pointer rounded-xl bg-brand px-5 font-navigation text-sm font-semibold text-white transition hover:bg-brand/90"
          >
            Apply
          </button>
          {(search || status) && (
            <Link
              href="/admin/orders"
              className="grid h-11 place-items-center rounded-xl border px-4 text-sm font-semibold text-bakery-muted transition hover:border-brand hover:text-brand"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

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
          <div className="overflow-x-auto">
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
                {result.orders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-brand/5"
                  >
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
                    </td>
                    <td className="px-5 py-4 text-bakery-muted">
                      {order._count.items}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold sm:px-6">
                      {formatPrice(order.totalPesewas)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
