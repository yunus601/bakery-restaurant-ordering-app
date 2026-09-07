"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

import type { CartItem } from "@/stores/cart";
import { useCartStore } from "@/stores/cart";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatters";

type CartLineItemProps = {
  item: CartItem;
};

export function CartLineItem({ item }: CartLineItemProps) {
  const removeItem = useCartStore((state) => state.removeItem);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const isOpen = useCartStore((state) => state.isOpen);

  return (
    <article className="flex gap-4 rounded-xl border bg-card p-4">
      <div className={`flex items-center gap-4 ${isOpen ? "mb-4" : "mb-0"}`}>
        <div className="relative  size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="96px"
            className="object-contain p-2"
          />
        </div>
        <div className="flex flex-col">
          <h2 className="truncate font-navigation font-semibold">
            {item.name}
          </h2>

          <p className="mt-1 text-sm text-bakery-muted">
            {formatPrice(item.pricePesewas)}
          </p>
        </div>
      </div>

      <div className="min-w-0 flex-1 mt-auto ">
        <div className="mt-3 flex items-center gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={`Decrease ${item.name} quantity`}
            onClick={() => setQuantity(item.productId, item.quantity - 1)}
          >
            <Minus />
          </Button>

          <span className="min-w-7 text-center" aria-label="Quantity">
            {item.quantity}
          </span>

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={`Increase ${item.name} quantity`}
            onClick={() => setQuantity(item.productId, item.quantity + 1)}
          >
            <Plus />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${item.name} from cart`}
            onClick={() => removeItem(item.productId)}
            className=" text-destructive"
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </article>
  );
}
