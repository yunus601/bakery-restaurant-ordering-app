"use client";

import { Product } from "@/types/product";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_ITEM_QUANTITY = 99;

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  pricePesewas: number;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  isOpen: boolean;

  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  updateItemPrices: (
    updates: Array<{ productId: string; pricePesewas: number }>,
  ) => void;
  clearCart: () => void;

  openCart: () => void;
  closeCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (product) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.productId === product.id,
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? {
                      ...item,
                      quantity: Math.min(item.quantity + 1, MAX_ITEM_QUANTITY),
                    }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                imageUrl: product.imageUrl,
                pricePesewas: product.pricePesewas,
                quantity: 1,
              },
            ],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.productId !== productId)
              : state.items.map((item) =>
                  item.productId === productId
                    ? {
                        ...item,
                        quantity: Math.min(
                          Math.floor(quantity),
                          MAX_ITEM_QUANTITY,
                        ),
                      }
                    : item,
                ),
        })),

      updateItemPrices: (updates) =>
        set((state) => {
          const pricesByProductId = new Map(
            updates.map((update) => [update.productId, update.pricePesewas]),
          );

          return {
            items: state.items.map((item) => {
              const pricePesewas = pricesByProductId.get(item.productId);
              return pricePesewas === undefined
                ? item
                : { ...item, pricePesewas };
            }),
          };
        }),

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: "confirm-bakery-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
