"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { useCartStore } from "@/stores/cart";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { CartLineItem } from "./CartLineItem";

export function CartSheet() {
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const openCart = useCartStore((state) => state.openCart);
  const closeCart = useCartStore((state) => state.closeCart);

  const subtotal = items.reduce(
    (total, item) => total + item.pricePesewas * item.quantity,
    0,
  );

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          openCart();
        } else {
          closeCart();
        }
      }}
    >
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b p-6">
          <SheetTitle className="font-display text-3xl">Your cart</SheetTitle>

          <SheetDescription>
            Review your items before checkout.
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="size-12 text-bakery-muted" />

            <p className="mt-4 font-navigation text-lg font-semibold">
              Your cart is empty
            </p>

            <p className="mt-2 text-sm text-bakery-muted">
              Add something fresh from our bakery.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-6 overflow-y-auto px-2 py-0">
              {items.map((item) => (
                <CartLineItem key={item.productId} item={item} />
              ))}
            </div>

            <SheetFooter className="border-t p-6">
              <div className="mb-3 flex items-center justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <Link
                href="/checkout"
                onClick={closeCart}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full bg-brand font-navigation text-surface hover:bg-brand/90",
                )}
              >
                Continue to checkout
              </Link>

              <p className="text-center text-xs text-bakery-muted">
                Delivery fees are calculated during checkout.
              </p>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
