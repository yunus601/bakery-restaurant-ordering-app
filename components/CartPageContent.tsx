"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { useCartStore } from "@/stores/cart";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import { CartLineItem } from "./CartLineItem";

export function CartPageContent() {
  const items = useCartStore((state) => state.items);
  const hasHydrated = useHasHydrated();

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const subtotal = items.reduce(
    (total, item) => total + item.pricePesewas * item.quantity,
    0,
  );

  if (!hasHydrated) {
    return (
      <div
        aria-label="Loading cart"
        className="mx-auto h-72 max-w-4xl animate-pulse rounded-2xl bg-muted"
      />
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
          Add some freshly baked favourites to begin your order.
        </p>

        <Link
          href="/#top-products"
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-8 bg-brand font-navigation text-surface hover:bg-brand/90",
          )}
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col gap-3 border-b pb-4">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl mb-5">
          Your cart
        </h1>
        <div className="flex justify-between items-center gap-4">
          <p className="mt-2 text-bakery-muted text-lg">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>

          <p className="text-xl font-semibold">
            Subtotal: {formatPrice(subtotal)}
          </p>
        </div>
      </div>

      <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          {items.map((item) => (
            <CartLineItem key={item.productId} item={item} />
          ))}
        </div>

        <aside className="h-fit rounded-xl border bg-card p-6">
          <h2 className="font-navigation text-xl font-semibold">
            Order summary
          </h2>

          <div className="mt-6 flex justify-between border-b pb-4">
            <span className="text-bakery-muted">Subtotal</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>

          <p className="mt-4 text-sm text-bakery-muted">
            Delivery fees are calculated after you select pickup or delivery.
          </p>

          <Link
            href="/checkout"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-6 w-full bg-brand font-navigation text-surface hover:bg-brand/90",
            )}
          >
            Continue to checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
