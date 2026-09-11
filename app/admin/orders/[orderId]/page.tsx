import {
  ArrowLeft,
  Circle,
  Croissant,
  Mail,
  MapPin,
  Phone,
  Store,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { PaymentStatusControl } from "@/components/admin/PaymentStatusControl";
import { PrintOrderButton } from "@/components/admin/orders/PrintOrderButton";
import { formatPrice } from "@/lib/formatters";
import { getAllowedPaymentStatuses } from "@/lib/orders/payment-transition";
import { getAllowedOrderStatuses } from "@/lib/orders/status-transition";
import { getAdminOrderById } from "@/lib/queries/admin-orders";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en-GH", {
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

type OrderDetailPageProps = { params: Promise<{ orderId: string }> };

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  const order = await getAdminOrderById(orderId);

  if (!order) notFound();
  const allowedStatuses = getAllowedOrderStatuses(
    order.status,
    order.fulfillmentMethod,
  );
  const allowedPaymentStatuses =
    order.status === "CANCELLED" && order.paymentStatus !== "PAID"
      ? []
      : getAllowedPaymentStatuses(order.paymentStatus);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 print:max-w-none print:px-0 print:py-0 sm:px-8 sm:py-10">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline print:hidden">
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to orders
      </Link>

      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-bakery-muted">Order</p>
          <h1 className="mt-1 font-display text-4xl font-semibold sm:text-5xl">{order.orderNumber}</h1>
          <p className="mt-2 text-sm text-bakery-muted">Placed {dateFormatter.format(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <PrintOrderButton />
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="border-b px-5 py-5 sm:px-6">
              <h2 className="font-navigation text-xl font-semibold">Order items</h2>
              <p className="mt-1 text-sm text-bakery-muted">Product names and prices are preserved from checkout.</p>
            </div>
            <ul className="divide-y">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-5 sm:px-6">
                  <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#faf7f4] text-brand">
                    {item.imageUrlSnapshot ? (
                      <Image src={item.imageUrlSnapshot} alt="" fill sizes="64px" className="object-contain" />
                    ) : (
                      <Croissant className="size-6" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-navigation font-semibold">{item.productNameSnapshot}</p>
                    <p className="mt-1 text-sm text-bakery-muted">{formatPrice(item.unitPricePesewas)} × {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.lineTotalPesewas)}</p>
                </li>
              ))}
            </ul>
            <dl className="space-y-3 border-t bg-[#faf7f4] px-5 py-5 text-sm sm:px-6">
              <TotalRow label="Subtotal" value={formatPrice(order.subtotalPesewas)} />
              <TotalRow label="Delivery fee" value={formatPrice(order.deliveryFeePesewas)} />
              <TotalRow label="Total" value={formatPrice(order.totalPesewas)} emphasized />
            </dl>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <InfoCard title="Customer">
              <p className="font-semibold">{order.customerName}</p>
              <a href={`tel:${order.customerPhone}`} className="mt-3 flex items-center gap-2 text-sm text-brand hover:underline">
                <Phone className="size-4" aria-hidden="true" /> {order.customerPhone}
              </a>
              {order.customerEmail && (
                <a href={`mailto:${order.customerEmail}`} className="mt-2 flex items-center gap-2 break-all text-sm text-brand hover:underline">
                  <Mail className="size-4 shrink-0" aria-hidden="true" /> {order.customerEmail}
                </a>
              )}
            </InfoCard>

            <InfoCard title="Fulfilment">
              <p className="flex items-center gap-2 font-semibold">
                {order.fulfillmentMethod === "DELIVERY" ? <MapPin className="size-4 text-brand" /> : <Store className="size-4 text-brand" />}
                {formatLabel(order.fulfillmentMethod)}
              </p>
              {order.fulfillmentMethod === "DELIVERY" && (
                <div className="mt-3 space-y-1 text-sm text-bakery-muted">
                  {order.deliveryZoneName && (
                    <p className="font-semibold text-foreground">
                      {order.deliveryZoneName}
                    </p>
                  )}
                  <p>{order.deliveryAddressLine}</p>
                  <p>{[order.deliveryCity, order.deliveryRegion].filter(Boolean).join(", ")}</p>
                  {order.deliveryDirections && <p className="pt-2">Directions: {order.deliveryDirections}</p>}
                </div>
              )}
            </InfoCard>
          </section>

          {order.customerNote && (
            <InfoCard title="Customer note">
              <p className="whitespace-pre-wrap text-sm leading-6 text-bakery-muted">{order.customerNote}</p>
            </InfoCard>
          )}

          {order.cancellationReason && (
            <InfoCard title="Cancellation reason">
              <p className="whitespace-pre-wrap text-sm leading-6 text-red-800">
                {order.cancellationReason}
              </p>
            </InfoCard>
          )}
        </div>

        <aside className="space-y-6 xl:sticky xl:top-6 xl:h-fit">
          <InfoCard title="Order status">
            <StatusBadge status={order.status} />
            <div className="mt-5 border-t pt-5 print:hidden">
              <OrderStatusControl
                orderId={order.id}
                currentStatus={order.status}
                allowedStatuses={allowedStatuses}
                paymentStatus={order.paymentStatus}
              />
            </div>
          </InfoCard>
          <InfoCard title="Payment">
            <DetailRow label="Method" value={formatLabel(order.paymentMethod)} />
            <DetailRow label="Status" value={formatLabel(order.paymentStatus)} />
            <div className="mt-5 border-t pt-5 print:hidden">
              <PaymentStatusControl
                orderId={order.id}
                currentStatus={order.paymentStatus}
                allowedStatuses={allowedPaymentStatuses}
                isOrderCancelled={order.status === "CANCELLED"}
              />
            </div>
          </InfoCard>
          <div className="print:hidden">
          <InfoCard title="Activity timeline">
            <ol className="space-y-0">
              <TimelineItem
                title="Order placed"
                detail="Submitted by the customer"
                createdAt={order.createdAt}
              />
              {order.events.map((event) => {
                const actorName = event.actor
                  ? [event.actor.firstName, event.actor.lastName]
                      .filter(Boolean)
                      .join(" ") || event.actor.email || "Former staff member"
                  : "Former staff member";
                const eventName =
                  event.type === "STATUS_CHANGED"
                    ? "Order status changed"
                    : "Payment status changed";
                const change = `${formatLabel(event.fromValue ?? "unknown")} → ${formatLabel(event.toValue ?? "unknown")}`;

                return (
                  <TimelineItem
                    key={event.id}
                    title={eventName}
                    detail={`${change} · ${actorName}`}
                    reason={event.reason}
                    createdAt={event.createdAt}
                  />
                );
              })}
            </ol>
          </InfoCard>
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"><h2 className="mb-4 font-navigation text-lg font-semibold">{title}</h2>{children}</section>;
}

function StatusBadge({ status }: { status: string }) {
  return <span className={cn("inline-flex w-fit rounded-full px-3 py-1.5 text-sm font-semibold", statusStyles[status])}>{formatLabel(status)}</span>;
}

function TotalRow({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return <div className={cn("flex justify-between gap-4", emphasized && "border-t pt-3 text-lg font-bold")}><dt>{label}</dt><dd>{value}</dd></div>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 border-b py-3 text-sm first:pt-0 last:border-0 last:pb-0"><span className="text-bakery-muted">{label}</span><span className="text-right font-medium capitalize">{value}</span></div>;
}

function TimelineItem({
  title,
  detail,
  reason,
  createdAt,
}: {
  title: string;
  detail: string;
  reason?: string | null;
  createdAt: Date;
}) {
  return (
    <li className="group relative grid grid-cols-[1rem_1fr] gap-3 pb-6 last:pb-0">
      <span className="absolute bottom-0 left-[0.45rem] top-4 w-px bg-border group-last:hidden" />
      <Circle
        className="relative mt-1 size-4 fill-brand text-brand"
        aria-hidden="true"
      />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-bakery-muted">{detail}</p>
        {reason && (
          <p className="mt-2 rounded-lg bg-red-50 p-2 text-xs leading-5 text-red-800">
            {reason}
          </p>
        )}
        <time
          dateTime={createdAt.toISOString()}
          className="mt-1 block text-xs text-bakery-muted"
        >
          {dateFormatter.format(createdAt)}
        </time>
      </div>
    </li>
  );
}

function formatLabel(value: string) {
  return value.toLowerCase().replaceAll("_", " ");
}
