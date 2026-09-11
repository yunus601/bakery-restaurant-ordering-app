import {
  Banknote,
  CheckCircle2,
  MapPin,
  Package,
  Phone,
  ReceiptText,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/Header";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatters";
import { getGuestOrderConfirmation } from "@/lib/queries/customer-orders";
import { getStoreSettings } from "@/lib/queries/store-settings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order confirmation | Confirm Bakery",
  description: "Review your Confirm Bakery order confirmation.",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

const orderDateFormatter = new Intl.DateTimeFormat("en-GH", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Africa/Accra",
});

type GuestOrderConfirmationPageProps = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ key?: string | string[] }>;
};

export default async function GuestOrderConfirmationPage({
  params,
  searchParams,
}: GuestOrderConfirmationPageProps) {
  const [{ orderId }, query] = await Promise.all([params, searchParams]);
  const key = Array.isArray(query.key) ? query.key[0] : query.key;

  if (!key) notFound();

  const [order, storeSettings] = await Promise.all([
    getGuestOrderConfirmation(orderId, key),
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
        <div className="mx-auto max-w-4xl">
          <header className="text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-green-100 text-green-700">
              <CheckCircle2 className="size-9" aria-hidden="true" />
            </span>
            <p className="mt-5 font-navigation font-semibold text-brand">
              Order received
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
              Thank you for your order
            </h1>
            <p className="mt-3 text-bakery-muted">
              Order {order.orderNumber} ·{" "}
              {orderDateFormatter.format(order.createdAt)}
            </p>
          </header>

          <div className="mt-9 grid gap-6 lg:grid-cols-[1.3fr_0.8fr]">
            <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="border-b px-5 py-5 sm:px-6">
                <h2 className="font-navigation text-xl font-semibold">
                  Your items
                </h2>
              </div>
              <div className="divide-y">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 px-5 py-4 sm:px-6"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                      <Package className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-navigation font-semibold">
                        {item.productNameSnapshot}
                      </p>
                      <p className="mt-1 text-sm text-bakery-muted">
                        {item.quantity} × {formatPrice(item.unitPricePesewas)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatPrice(item.lineTotalPesewas)}
                    </p>
                  </div>
                ))}
              </div>
              <dl className="space-y-3 border-t bg-[#faf7f4] px-5 py-5 text-sm sm:px-6">
                <PriceRow label="Subtotal" value={order.subtotalPesewas} />
                <PriceRow label="Delivery" value={order.deliveryFeePesewas} />
                <div className="flex justify-between border-t pt-3 font-navigation text-lg font-bold">
                  <dt>Total</dt>
                  <dd>{formatPrice(order.totalPesewas)}</dd>
                </div>
              </dl>
            </section>

            <aside className="space-y-5">
              <InfoCard
                icon={isDelivery ? MapPin : Package}
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
                    Collect from {storeSettings.pickupAddress}. We’ll contact
                    you when it is ready, usually in{" "}
                    {storeSettings.pickupPreparationMinMinutes}–
                    {storeSettings.pickupPreparationMaxMinutes} minutes.
                  </p>
                )}
              </InfoCard>

              <InfoCard icon={Banknote} title="Payment instructions">
                <p className="font-medium">
                  {isDelivery
                    ? "Please pay cash when your order arrives."
                    : "Please pay when you collect your order."}
                </p>
                <p className="mt-1 capitalize text-bakery-muted">
                  Status: {order.paymentStatus.toLowerCase()}
                </p>
              </InfoCard>

              <InfoCard icon={Phone} title="Contact details">
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

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/menu"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-brand font-navigation text-surface hover:bg-brand/90",
              )}
            >
              Continue shopping
            </Link>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "font-navigation",
              )}
            >
              Return home
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
      <dt>{label}</dt>
      <dd>{formatPrice(value)}</dd>
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
