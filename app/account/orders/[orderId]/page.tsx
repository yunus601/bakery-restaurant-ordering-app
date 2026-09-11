import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  Truck,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderStatusBadge } from "@/components/account/orders/OrderStatusBadge";
import { CustomerOrderCancellation } from "@/components/account/orders/CustomerOrderCancellation";
import { OrderStatusRefresh } from "@/components/account/orders/OrderStatusRefresh";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/Header";
import { formatPrice } from "@/lib/formatters";
import { getCustomerOrderById } from "@/lib/queries/customer-orders";
import { getStoreSettings } from "@/lib/queries/store-settings";

export const metadata: Metadata = {
  title: "Order details",
};

const orderDateFormatter = new Intl.DateTimeFormat("en-GH", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Africa/Accra",
});

type CustomerOrderPageProps = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ placed?: string | string[] }>;
};

export default async function CustomerOrderPage({
  params,
  searchParams,
}: CustomerOrderPageProps) {
  const { orderId } = await params;
  const query = await searchParams;
  const wasJustPlaced =
    (Array.isArray(query.placed) ? query.placed[0] : query.placed) === "1";
  const [order, storeSettings] = await Promise.all([
    getCustomerOrderById(orderId),
    getStoreSettings(),
  ]);

  if (!order) notFound();

  const isDelivery = order.fulfillmentMethod === "DELIVERY";

  return (
    <main className="min-h-screen bg-background">
      <div className="relative h-24 bg-foreground">
        <SiteHeader />
      </div>

      <section className="min-h-[60vh] px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-5xl">
          {wasJustPlaced && (
            <div
              role="status"
              className="mb-7 flex gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-900"
            >
              <CheckCircle2
                className="mt-0.5 size-5 shrink-0"
                aria-hidden="true"
              />
              <div>
                <p className="font-navigation font-semibold">Order received</p>
                <p className="mt-1 text-sm">
                  Thank you. Your order is confirmed in our system and can be
                  safely revisited from this page.
                </p>
              </div>
            </div>
          )}
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to orders
          </Link>

          <header className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-navigation text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                Order details
              </p>
              <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
                {order.orderNumber}
              </h1>
              <time
                dateTime={order.createdAt.toISOString()}
                className="mt-3 block text-sm text-bakery-muted"
              >
                Placed {orderDateFormatter.format(order.createdAt)}
              </time>
            </div>
            <div className="space-y-3 sm:text-right">
              <OrderStatusBadge status={order.status} />
              <OrderStatusRefresh
                status={order.status}
                initialCheckedAt={new Date().toISOString()}
              />
            </div>
          </header>

          <div className="mt-9 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="border-b px-5 py-5 sm:px-6">
                <h2 className="font-navigation text-xl font-semibold">
                  Items
                </h2>
              </div>
              <div className="divide-y">
                {order.items.map((item) => (
                  <article
                    key={item.id}
                    className="flex items-center gap-4 px-5 py-5 sm:px-6"
                  >
                    <div className="relative size-18 shrink-0 overflow-hidden rounded-xl bg-bakery-cream">
                      {item.imageUrlSnapshot ? (
                        <Image
                          src={item.imageUrlSnapshot}
                          alt=""
                          fill
                          sizes="72px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="grid size-full place-items-center text-brand">
                          <Package className="size-6" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-navigation font-semibold">
                        {item.productNameSnapshot}
                      </h3>
                      <p className="mt-1 text-sm text-bakery-muted">
                        {item.quantity} × {formatPrice(item.unitPricePesewas)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatPrice(item.lineTotalPesewas)}
                    </p>
                  </article>
                ))}
              </div>
              <div className="space-y-3 border-t bg-[#faf7f4] px-5 py-5 text-sm sm:px-6">
                <PriceRow label="Subtotal" value={order.subtotalPesewas} />
                <PriceRow label="Delivery" value={order.deliveryFeePesewas} />
                <div className="flex items-center justify-between border-t pt-3 font-navigation text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.totalPesewas)}</span>
                </div>
              </div>
            </section>

            <aside className="space-y-5">
              <InfoCard
                icon={isDelivery ? Truck : Package}
                title={isDelivery ? "Delivery" : "Pickup"}
              >
                {isDelivery ? (
                  <address className="not-italic leading-6 text-bakery-muted">
                    {order.deliveryZoneName && (
                      <span className="mb-2 block font-semibold text-foreground">
                        {order.deliveryZoneName}
                      </span>
                    )}
                    {order.deliveryAddressLine}
                    <br />
                    {[order.deliveryCity, order.deliveryRegion]
                      .filter(Boolean)
                      .join(", ")}
                    {order.deliveryDirections && (
                      <span className="mt-2 block">
                        {order.deliveryDirections}
                      </span>
                    )}
                  </address>
                ) : (
                  <p className="text-bakery-muted">
                    Collect from {storeSettings.pickupAddress}. We’ll let you
                    know when it is ready, usually in{" "}
                    {storeSettings.pickupPreparationMinMinutes}–
                    {storeSettings.pickupPreparationMaxMinutes} minutes.
                  </p>
                )}
              </InfoCard>

              <InfoCard icon={Banknote} title="Payment">
                <p className="capitalize text-bakery-muted">
                  {order.paymentMethod.toLowerCase().replaceAll("_", " ")}
                </p>
                <p className="mt-1 capitalize font-semibold">
                  {order.paymentStatus.toLowerCase()}
                </p>
              </InfoCard>

              <InfoCard icon={Phone} title="Contact">
                <p className="font-medium">{order.customerName}</p>
                <p className="mt-1 text-bakery-muted">{order.customerPhone}</p>
                {order.customerEmail && (
                  <p className="mt-1 break-all text-bakery-muted">
                    {order.customerEmail}
                  </p>
                )}
              </InfoCard>

              {order.customerNote && (
                <InfoCard icon={ReceiptText} title="Order note">
                  <p className="leading-6 text-bakery-muted">
                    {order.customerNote}
                  </p>
                </InfoCard>
              )}

              {order.status === "PLACED" &&
              storeSettings.customerCancellationEnabled ? (
                <InfoCard icon={ReceiptText} title="Need to cancel?">
                  <p className="mb-4 text-bakery-muted">
                    You can cancel before the bakery starts preparing your order.
                  </p>
                  <CustomerOrderCancellation orderId={order.id} />
                </InfoCard>
              ) : order.status !== "CANCELLED" ? (
                <InfoCard icon={Phone} title="Need to make a change?">
                  <p className="leading-6 text-bakery-muted">
                    Online cancellation is no longer available. Please contact the
                    bakery for help with this order.
                  </p>
                  <a
                    href={`tel:${storeSettings.contactPhone}`}
                    className="mt-3 inline-block font-semibold text-brand hover:underline"
                  >
                    Call {storeSettings.contactPhone}
                  </a>
                </InfoCard>
              ) : order.cancellationReason ? (
                <InfoCard icon={ReceiptText} title="Cancellation">
                  <p className="leading-6 text-bakery-muted">
                    {order.cancellationReason}
                  </p>
                </InfoCard>
              ) : null}
            </aside>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/menu"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-brand px-6 font-navigation text-sm font-semibold text-surface transition hover:bg-brand/90"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-bakery-muted">
      <span>{label}</span>
      <span>{formatPrice(value)}</span>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof MapPin;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <h2 className="font-navigation font-semibold">{title}</h2>
      </div>
      <div className="mt-4 text-sm">{children}</div>
    </section>
  );
}
