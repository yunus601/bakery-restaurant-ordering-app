import { Banknote, ClipboardList, Clock3, PackageCheck } from "lucide-react";

import { formatPrice } from "@/lib/formatters";
import { getAdminDashboardSummary } from "@/lib/queries/admin-dashboard";
import { cn } from "@/lib/utils";

const orderDateFormatter = new Intl.DateTimeFormat("en-GH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Accra",
});

const statusStyles: Record<string, string> = {
  PLACED: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-violet-100 text-violet-800",
  READY: "bg-emerald-100 text-emerald-800",
  OUT_FOR_DELIVERY: "bg-cyan-100 text-cyan-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function AdminDashboardPage() {
  const summary = await getAdminDashboardSummary();
  const summaryCards = [
    { label: "Orders today", value: summary.ordersToday.toLocaleString("en-GH"), note: "Placed since midnight", icon: ClipboardList },
    { label: "Pending orders", value: summary.pendingOrders.toLocaleString("en-GH"), note: "Needs attention", icon: Clock3 },
    { label: "Revenue today", value: formatPrice(summary.revenueTodayPesewas), note: "Paid orders today", icon: Banknote },
    { label: "Available products", value: summary.availableProducts.toLocaleString("en-GH"), note: "Visible for ordering", icon: PackageCheck },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-navigation text-sm font-semibold uppercase tracking-[0.18em] text-brand">Operations</p>
          <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Bakery overview</h1>
        </div>
        <p className="max-w-md text-sm text-bakery-muted sm:text-right">Monitor orders, products, customers, and daily performance.</p>
      </div>

      <section aria-label="Bakery summary" className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-bakery-muted">{card.label}</p>
                  <p className="mt-3 text-3xl font-bold">{card.value}</p>
                </div>
                <span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 text-xs text-bakery-muted">{card.note}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-5 py-5 sm:px-6">
          <h2 className="font-navigation text-xl font-semibold">Recent orders</h2>
          <p className="mt-1 text-sm text-bakery-muted">The eight newest customer orders.</p>
        </div>

        {summary.recentOrders.length === 0 ? (
          <div className="grid min-h-72 place-items-center px-6 py-12 text-center">
            <div>
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand/10 text-brand">
                <ClipboardList className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-navigation font-semibold">No orders yet</h3>
              <p className="mt-2 max-w-sm text-sm text-bakery-muted">New pickup and delivery orders will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left text-sm">
              <thead className="bg-[#faf7f4] text-xs uppercase tracking-wide text-bakery-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold sm:px-6">Order</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Fulfilment</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Items</th>
                  <th className="px-5 py-3 text-right font-semibold sm:px-6">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {summary.recentOrders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-brand/5">
                    <td className="px-5 py-4 sm:px-6">
                      <p className="font-navigation font-semibold text-brand">{order.orderNumber}</p>
                      <time dateTime={order.createdAt.toISOString()} className="mt-1 block text-xs text-bakery-muted">
                        {orderDateFormatter.format(order.createdAt)}
                      </time>
                    </td>
                    <td className="px-5 py-4 font-medium">{order.customerName}</td>
                    <td className="px-5 py-4 capitalize text-bakery-muted">{order.fulfillmentMethod.toLowerCase()}</td>
                    <td className="px-5 py-4">
                      <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", statusStyles[order.status] ?? "bg-gray-100 text-gray-700")}>{order.status.toLowerCase().replaceAll("_", " ")}</span>
                    </td>
                    <td className="px-5 py-4 text-bakery-muted">{order._count.items}</td>
                    <td className="px-5 py-4 text-right font-semibold sm:px-6">{formatPrice(order.totalPesewas)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
