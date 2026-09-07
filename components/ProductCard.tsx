"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

import { formatPrice } from "@/lib/formatters";
import { useCartStore } from "@/stores/cart";
import { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <Card className="group overflow-hidden border-0 bg-foreground py-0 text-surface ring-0">
      <CardContent className="relative aspect-[360/411] p-0">
        <Image
          src="/images/products/asset-2.png"
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        <div className="absolute inset-x-6 top-5 h-56">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 280px"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="absolute inset-x-6 bottom-6">
          <p className="font-navigation text-sm text-brand-accent">
            {product.category}
          </p>

          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <CardTitle className="font-navigation text-lg font-semibold text-surface">
                {product.name}
              </CardTitle>

              <p className="mt-2 text-lg font-semibold text-surface">
                {formatPrice(product.pricePesewas)}
              </p>
            </div>

            <Button
              type="button"
              disabled={!product.isAvailable}
              className="bg-brand text-surface hover:bg-brand/90"
              onClick={() => addItem(product)}
            >
              {product.isAvailable ? "Add" : "Sold out"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
