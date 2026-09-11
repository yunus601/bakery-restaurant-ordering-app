"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, ShoppingBag, Store } from "lucide-react";

import {
  createOrderAction,
  type CheckoutActionState,
} from "@/app/checkout/action";
import { buttonVariants } from "@/components/ui/button";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import { formatPrice } from "@/lib/formatters";
import type { getActiveDeliveryZones } from "@/lib/queries/delivery-zones";
import type { StoreSettings } from "@/lib/queries/store-settings";
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

export type CheckoutAddress = {
  id: string;
  label: string | null;
  recipient: string;
  phone: string;
  addressLine: string;
  city: string;
  region: string | null;
  directions: string | null;
  isDefault: boolean;
};

type CheckoutPageContentProps = {
  idempotencyKey: string;
  customer: CheckoutCustomer | null;
  addresses: CheckoutAddress[];
  storeSettings: StoreSettings;
  deliveryZones: Awaited<ReturnType<typeof getActiveDeliveryZones>>;
};

export function CheckoutPageContent({
  idempotencyKey,
  customer,
  addresses,
  storeSettings,
  deliveryZones,
}: CheckoutPageContentProps) {
  const hasHydrated = useHasHydrated();
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const updateItemPrices = useCartStore((state) => state.updateItemPrices);
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<FulfillmentMethod>(
      storeSettings.pickupEnabled ? "PICKUP" : "DELIVERY",
    );
  const defaultAddress =
    addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [customerName, setCustomerName] = useState(customer?.name ?? "");
  const [customerPhone, setCustomerPhone] = useState(customer?.phone ?? "");
  const [deliveryAddressLine, setDeliveryAddressLine] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryRegion, setDeliveryRegion] = useState("");
  const [deliveryDirections, setDeliveryDirections] = useState("");
  const [selectedDeliveryZoneId, setSelectedDeliveryZoneId] = useState("");
  const selectedDeliveryZone = deliveryZones.find(
    (zone) => zone.id === selectedDeliveryZoneId,
  );
  const selectedMethodAvailable =
    fulfillmentMethod === "PICKUP"
      ? storeSettings.pickupEnabled
      : storeSettings.deliveryEnabled && deliveryZones.length > 0;

  function applySavedAddress(address: CheckoutAddress) {
    setSelectedAddressId(address.id);
    setCustomerName(address.recipient);
    setCustomerPhone(address.phone);
    setDeliveryAddressLine(address.addressLine);
    setDeliveryCity(address.city);
    setDeliveryRegion(address.region ?? "");
    setDeliveryDirections(address.directions ?? "");
  }

  function chooseDelivery() {
    setFulfillmentMethod("DELIVERY");

    if (defaultAddress && !deliveryAddressLine) {
      applySavedAddress(defaultAddress);
    }
  }

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

      const destination = state.linkedToAccount
        ? `/account/orders/${state.order.id}?placed=1`
        : `/order-confirmation/${state.order.id}?key=${encodeURIComponent(idempotencyKey)}`;

      router.replace(destination);
    }
  }, [
    clearCart,
    idempotencyKey,
    router,
    state.linkedToAccount,
    state.order,
    state.success,
  ]);

  useEffect(() => {
    const priceUpdates = state.itemIssues?.flatMap((issue) =>
      issue.reason === "price_changed" &&
      issue.currentPricePesewas !== undefined
        ? [
            {
              productId: issue.productId,
              pricePesewas: issue.currentPricePesewas,
            },
          ]
        : [],
    );

    if (priceUpdates?.length) updateItemPrices(priceUpdates);
  }, [state.itemIssues, updateItemPrices]);

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
      <div role="status" className="mx-auto max-w-xl py-20 text-center">
        <p className="font-navigation font-semibold text-brand">
          Order received
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold">
          Opening your confirmation…
        </h1>
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
              clientUnitPricePesewas: item.pricePesewas,
            })),
          )}
        />
        <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
        {!storeSettings.acceptingOrders && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 lg:col-span-2" role="status">
            <p className="font-navigation font-semibold">Ordering is currently paused</p>
            <p className="mt-1">Please check back during our opening hours: {storeSettings.openingHours}</p>
          </div>
        )}
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
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
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
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
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
                disabled={!storeSettings.pickupEnabled}
              />
              <FulfillmentOption
                value="DELIVERY"
                title="Delivery"
                description="We will bring your order to you."
                checked={fulfillmentMethod === "DELIVERY"}
                onChange={chooseDelivery}
                icon={<MapPin className="size-5" />}
                disabled={
                  !storeSettings.deliveryEnabled || deliveryZones.length === 0
                }
              />
            </div>

            {fulfillmentMethod === "DELIVERY" && (
              <div className="mt-6 grid gap-5 border-t pt-6 sm:grid-cols-2">
                <label className="text-sm font-medium sm:col-span-2">
                  Delivery zone
                  <select
                    name="deliveryZoneId"
                    value={selectedDeliveryZoneId}
                    onChange={(event) =>
                      setSelectedDeliveryZoneId(event.target.value)
                    }
                    required
                    aria-invalid={Boolean(state.errors?.deliveryZoneId)}
                    className={fieldClassName}
                  >
                    <option value="">Select your area</option>
                    {deliveryZones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name} — {formatPrice(zone.deliveryFeePesewas)}
                        {zone.minimumOrderPesewas != null
                          ? ` (minimum ${formatPrice(zone.minimumOrderPesewas)})`
                          : ""}
                      </option>
                    ))}
                  </select>
                  <FieldError errors={state.errors?.deliveryZoneId} />
                  {deliveryZones.length === 0 && (
                    <span className="mt-2 block text-sm text-red-700">
                      Delivery is temporarily unavailable because no delivery
                      areas are active.
                    </span>
                  )}
                </label>
                {addresses.length > 0 && (
                  <fieldset className="sm:col-span-2">
                    <legend className="text-sm font-medium">
                      Saved addresses
                    </legend>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                      {addresses.map((address) => (
                        <label
                          key={address.id}
                          className={cn(
                            "cursor-pointer rounded-xl border p-4 text-sm transition-colors",
                            selectedAddressId === address.id
                              ? "border-brand bg-brand-accent/10"
                              : "border-border hover:border-brand/40",
                          )}
                        >
                          <span className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="savedAddress"
                              value={address.id}
                              checked={selectedAddressId === address.id}
                              onChange={() => applySavedAddress(address)}
                              className="mt-1 accent-[var(--brand)]"
                            />
                            <span>
                              <span className="block font-navigation font-semibold">
                                {address.label || "Delivery address"}
                                {address.isDefault && (
                                  <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-[0.65rem] text-brand">
                                    Default
                                  </span>
                                )}
                              </span>
                              <span className="mt-1 block leading-5 text-bakery-muted">
                                {address.addressLine}, {address.city}
                                {address.region ? ", " + address.region : ""}
                              </span>
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                    <Link
                      href="/account/addresses"
                      className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
                    >
                      Manage saved addresses
                    </Link>
                  </fieldset>
                )}

                <label className="text-sm font-medium sm:col-span-2">
                  Delivery address
                  <input
                    name="deliveryAddressLine"
                    value={deliveryAddressLine}
                    onChange={(event) => {
                      setSelectedAddressId("");
                      setDeliveryAddressLine(event.target.value);
                    }}
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
                    value={deliveryCity}
                    onChange={(event) => {
                      setSelectedAddressId("");
                      setDeliveryCity(event.target.value);
                    }}
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
                    value={deliveryRegion}
                    onChange={(event) => {
                      setSelectedAddressId("");
                      setDeliveryRegion(event.target.value);
                    }}
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
                    value={deliveryDirections}
                    onChange={(event) => {
                      setSelectedAddressId("");
                      setDeliveryDirections(event.target.value);
                    }}
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
                No online payment is required for this order. Pickup is from{" "}
                {storeSettings.pickupAddress}.
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
                  : selectedDeliveryZone
                    ? formatPrice(selectedDeliveryZone.deliveryFeePesewas)
                    : "Select a zone"}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex justify-between gap-4 border-t pt-5 text-lg font-semibold">
            <span>Total</span>
            <span>
              {fulfillmentMethod === "PICKUP"
                ? formatPrice(subtotal)
                : selectedDeliveryZone
                  ? formatPrice(
                      subtotal + selectedDeliveryZone.deliveryFeePesewas,
                    )
                  : "Select a zone"}
            </span>
          </div>

          <button
            type="submit"
            disabled={
              pending ||
              !storeSettings.acceptingOrders ||
              !selectedMethodAvailable
            }
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

          {state.itemIssues && state.itemIssues.length > 0 && (
            <ul className="mt-3 space-y-2 text-left text-sm" aria-live="polite">
              {state.itemIssues.map((issue) => (
                <li
                  key={issue.productId}
                  className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950"
                >
                  <span className="font-semibold">{issue.productName}:</span>{" "}
                  {issue.reason === "unavailable" ? (
                    "no longer available"
                  ) : (
                    <>
                      price changed from{" "}
                      {formatPrice(issue.previousPricePesewas ?? 0)} to{" "}
                      {formatPrice(issue.currentPricePesewas ?? 0)}. Your cart
                      has been updated.
                    </>
                  )}
                </li>
              ))}
            </ul>
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
  disabled?: boolean;
};

function FulfillmentOption({
  value,
  title,
  description,
  checked,
  onChange,
  icon,
  disabled = false,
}: FulfillmentOptionProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
        disabled && "cursor-not-allowed opacity-50",
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
        disabled={disabled}
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
