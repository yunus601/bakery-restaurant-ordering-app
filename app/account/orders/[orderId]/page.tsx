import {
  ArrowLeft,
  Banknote,
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
import { OrderStatusRefresh } from "@/components/account/orders/OrderStatusRefresh";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/Header";
import { formatPrice } from "@/lib/formatters";
import { getCustomerOrderById } from "@/lib/queries/customer-orders";

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
};

export default async function CustomerOrderPage({
  params,
}: CustomerOrderPageProps) {
  const { orderId } = await params;
  const order = await getCustomerOrderById(orderId);

  if (!order) notFound();

  const isDelivery = order.fulfillmentMethod === "DELIVERY";

  return (
    <main className="min-h-screen bg-background">
      <div className="relative h-24 bg-foreground">
        <SiteHeader />
      </div>

      <section className="min-h-[60vh] px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-5xl">
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
                    We’ll let you know when your order is ready for collection.
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
            </aside>
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
