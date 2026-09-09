"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, MapPin, ShoppingBag, Store } from "lucide-react";

import {
  createOrderAction,
  type CheckoutActionState,
} from "@/app/checkout/action";
import { buttonVariants } from "@/components/ui/button";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import { formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart";

type FulfillmentMethod = "PICKUP" | "DELIVERY";

const initialCheckoutState: CheckoutActionState = {
  success: false,
};

const fieldClassName =
  "mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15";

type CheckoutCustomer = {
  name: string;
  email: string;
  phone: string;
};

type CheckoutPageContentProps = {
  idempotencyKey: string;
  customer: CheckoutCustomer | null;
  addresses: string | string[];
};

export function CheckoutPageContent({
  idempotencyKey,
  customer,
  addresses,
}: CheckoutPageContentProps) {
  const hasHydrated = useHasHydrated();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<FulfillmentMethod>("PICKUP");

  const [state, formAction, pending] = useActionState(
    createOrderAction,
    initialCheckoutState,
  );

  const subtotal = items.reduce(
    (total, item) => total + item.pricePesewas * item.quantity,
    0,
  );

  useEffect(() => {
    if (state.success && state.order) {
      clearCart();
    }
  }, [clearCart, state.order, state.success]);

  if (!hasHydrated) {
    return (
      <div
        aria-label="Loading checkout"
        className="mx-auto h-[36rem] max-w-6xl animate-pulse rounded-3xl bg-muted"
      />
    );
  }

  if (state.success && state.order) {
    return (
      <div
        role="status"
        className="mx-auto max-w-2xl rounded-3xl border border-green-200 bg-card px-6 py-12 text-center shadow-sm sm:px-12 sm:py-16"
      >
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 text-green-700">
          <CheckCircle2 className="size-9" aria-hidden="true" />
        </span>

        <p className="mt-6 font-navigation font-semibold text-brand">
          Order received
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
          Thank you for your order
        </h1>
        <p className="mx-auto mt-4 max-w-lg leading-7 text-bakery-muted">
          We have received your order and will contact you using the details
          provided if we need any clarification.
        </p>

        <dl className="mx-auto mt-8 grid max-w-md gap-4 rounded-2xl bg-brand-accent/10 p-6 text-left sm:grid-cols-2">
          <div>
            <dt className="text-sm text-bakery-muted">Order number</dt>
            <dd className="mt-1 break-all font-navigation font-semibold text-foreground">
              {state.order.orderNumber}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-bakery-muted">Order total</dt>
            <dd className="mt-1 font-navigation font-semibold text-foreground">
              {formatPrice(state.order.totalPesewas)}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm text-bakery-muted">Status</dt>
            <dd className="mt-1 font-navigation font-semibold capitalize text-foreground">
              {state.order.status.toLowerCase().replaceAll("_", " ")}
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {state.linkedToAccount && (
            <Link
              href={`/account/orders/${state.order.id}`}
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-brand font-navigation text-surface hover:bg-brand/90",
              )}
            >
              View order
            </Link>
          )}
          <Link
            href="/menu"
            className={cn(
              buttonVariants({
                variant: state.linkedToAccount ? "outline" : "default",
                size: "lg",
              }),
              cn(
                "font-navigation",
                !state.linkedToAccount &&
                  "bg-brand text-surface hover:bg-brand/90",
              ),
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
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <ShoppingBag className="mx-auto size-14 text-bakery-muted" />
        <h1 className="mt-5 font-display text-4xl font-semibold">
          Your cart is empty
        </h1>
        <p className="mt-4 text-bakery-muted">
          Add something delicious before heading to checkout.
        </p>
        <Link
          href="/menu"
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-8 bg-brand font-navigation text-surface hover:bg-brand/90",
          )}
        >
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-10">
        <p className="font-navigation font-semibold text-brand">Almost ready</p>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
          Checkout
        </h1>
      </div>

      <form
        className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_23rem]"
        action={formAction}
      >
        <input
          type="hidden"
          name="items"
          value={JSON.stringify(
            items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          )}
        />
        <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
        <div className="space-y-8">
          <section className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 className="font-navigation text-xl font-semibold">
              Contact details
            </h2>
            <p className="mt-1 text-sm text-bakery-muted">
              We will use these details for order updates.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium sm:col-span-2">
                Full name
                <input
                  name="customerName"
                  defaultValue={customer?.name ?? ""}
                  autoComplete="name"
                  required
                  className={fieldClassName}
                  placeholder="Ama Mensah"
                  aria-invalid={Boolean(state.errors?.customerName)}
                />
                <FieldError errors={state.errors?.customerName} />
              </label>

              <label className="text-sm font-medium">
                Phone number
                <input
                  name="customerPhone"
                  defaultValue={customer?.phone ?? ""}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                  className={fieldClassName}
                  placeholder="024 000 0000"
                  aria-invalid={Boolean(state.errors?.customerPhone)}
                />
                <FieldError errors={state.errors?.customerPhone} />
              </label>

              <label className="text-sm font-medium">
                Email address
                <span className="text-bakery-muted">(optional)</span>
                <input
                  name="customerEmail"
                  defaultValue={customer?.email ?? ""}
                  type="email"
                  autoComplete="email"
                  className={fieldClassName}
                  placeholder="ama@example.com"
                  aria-invalid={Boolean(state.errors?.customerEmail)}
                />
                <FieldError errors={state.errors?.customerEmail} />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 className="font-navigation text-xl font-semibold">
              Pickup or delivery
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <FulfillmentOption
                value="PICKUP"
                title="Pickup"
                description="Collect your order from our bakery."
                checked={fulfillmentMethod === "PICKUP"}
                onChange={() => setFulfillmentMethod("PICKUP")}
                icon={<Store className="size-5" />}
              />
              <FulfillmentOption
                value="DELIVERY"
                title="Delivery"
                description="We will bring your order to you."
                checked={fulfillmentMethod === "DELIVERY"}
                onChange={() => setFulfillmentMethod("DELIVERY")}
                icon={<MapPin className="size-5" />}
              />
            </div>

            {fulfillmentMethod === "DELIVERY" && (
              <div className="mt-6 grid gap-5 border-t pt-6 sm:grid-cols-2">
                <label className="text-sm font-medium sm:col-span-2">
                  Delivery address
                  <input
                    name="deliveryAddressLine"
                    autoComplete="street-address"
                    required
                    className={fieldClassName}
                    placeholder="House number, street, and area"
                    aria-invalid={Boolean(state.errors?.deliveryAddressLine)}
                  />
                  <FieldError errors={state.errors?.deliveryAddressLine} />
                </label>

                <label className="text-sm font-medium">
                  City
                  <input
                    name="deliveryCity"
                    autoComplete="address-level2"
                    required
                    className={fieldClassName}
                    placeholder="Accra"
                    aria-invalid={Boolean(state.errors?.deliveryCity)}
                  />
                  <FieldError errors={state.errors?.deliveryCity} />
                </label>

                <label className="text-sm font-medium">
                  Region <span className="text-bakery-muted">(optional)</span>
                  <input
                    name="deliveryRegion"
                    autoComplete="address-level1"
                    className={fieldClassName}
                    placeholder="Greater Accra"
                  />
                </label>

                <label className="text-sm font-medium sm:col-span-2">
                  Delivery directions{" "}
                  <span className="text-bakery-muted">(optional)</span>
                  <textarea
                    name="deliveryDirections"
                    rows={3}
                    className="mt-2 w-full resize-y rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                    placeholder="Landmarks or instructions that will help the rider"
                  />
                </label>
              </div>
            )}
          </section>

          <section className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 className="font-navigation text-xl font-semibold">Payment</h2>
            <div className="mt-5 rounded-xl border border-brand/20 bg-brand-accent/10 p-4">
              <p className="font-medium">
                {fulfillmentMethod === "PICKUP"
                  ? "Pay when you pick up"
                  : "Cash on delivery"}
              </p>
              <p className="mt-1 text-sm text-bakery-muted">
                No online payment is required for this order.
              </p>
            </div>
          </section>

          <label className="block rounded-2xl border bg-card p-6 text-sm font-medium sm:p-8">
            Order note <span className="text-bakery-muted">(optional)</span>
            <textarea
              name="customerNote"
              rows={4}
              className="mt-2 w-full resize-y rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              placeholder="Allergies, preferred pickup details, or another request"
            />
          </label>
        </div>

        <aside className="h-fit rounded-2xl border bg-card p-6 lg:sticky lg:top-6">
          <h2 className="font-navigation text-xl font-semibold">
            Order summary
          </h2>

          <ul className="mt-6 max-h-80 space-y-4 overflow-y-auto pr-1">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="mt-1 text-sm text-bakery-muted">
                    Qty {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {formatPrice(item.pricePesewas * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-3 border-t pt-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-bakery-muted">Subtotal</dt>
              <dd className="font-semibold">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-bakery-muted">Delivery fee</dt>
              <dd className="text-right font-semibold">
                {fulfillmentMethod === "PICKUP"
                  ? formatPrice(0)
                  : "Confirmed with order"}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex justify-between gap-4 border-t pt-5 text-lg font-semibold">
            <span>Total</span>
            <span>
              {fulfillmentMethod === "PICKUP"
                ? formatPrice(subtotal)
                : "Calculated on submit"}
            </span>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-6 h-11 w-full cursor-pointer rounded-lg bg-brand px-4 font-navigation text-sm font-semibold text-surface transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Checking order…" : "Place order"}
          </button>

          {state.message && (
            <p
              aria-live="polite"
              className={cn(
                "mt-4 rounded-lg p-3 text-center text-sm",
                state.success
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-700",
              )}
            >
              {state.message}
            </p>
          )}

          <p className="mt-3 text-center text-xs leading-5 text-bakery-muted">
            By placing this order, you confirm that the contact and fulfilment
            details above are correct.
          </p>
        </aside>
      </form>
    </div>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <span className="mt-1 block text-sm text-red-700">{errors[0]}</span>;
}

type FulfillmentOptionProps = {
  value: FulfillmentMethod;
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  icon: React.ReactNode;
};

function FulfillmentOption({
  value,
  title,
  description,
  checked,
  onChange,
  icon,
}: FulfillmentOptionProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
        checked
          ? "border-brand bg-brand-accent/10"
          : "border-border hover:border-brand/40",
      )}
    >
      <input
        type="radio"
        name="fulfillmentMethod"
        value={value}
        checked={checked}
        onChange={onChange}
        className="mt-1 accent-[var(--brand)]"
      />
      <span className="text-brand">{icon}</span>
      <span>
        <span className="block font-navigation font-semibold">{title}</span>
        <span className="mt-1 block text-sm leading-5 text-bakery-muted">
          {description}
        </span>
      </span>
    </label>
  );
}
