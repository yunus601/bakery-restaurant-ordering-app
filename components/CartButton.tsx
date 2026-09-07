"use client";

import { ShoppingBag } from "lucide-react";

import { useCartStore } from "@/stores/cart";
import { useHasHydrated } from "@/hooks/use-has-hydrated";

export function CartButton() {
  const itemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  const openCart = useCartStore((state) => state.openCart);

  const hasHydrated = useHasHydrated();

  const visibleItemCount = hasHydrated ? itemCount : 0;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`View cart with ${visibleItemCount} items`}
      className="flex cursor-pointer items-center gap-2 rounded-lg border border-brand-accent px-4 py-2 font-navigation font-semibold text-brand-accent transition-colors hover:bg-brand-accent hover:text-foreground"
    >
      <ShoppingBag aria-hidden="true" className="size-4" />
      <span>Cart</span>
      <span aria-hidden="true">({visibleItemCount})</span>
    </button>
  );
}
