import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { getMenuProducts } from "@/lib/queries/products";

export const metadata: Metadata = {
  title: "Menu | Confirm Bakery",
  description:
    "Browse freshly baked breads, pastries, and cakes from Confirm Bakery.",
};

const categories = [
  { label: "All", slug: undefined },
  { label: "Bread", slug: "bread" },
  { label: "Pastries", slug: "pastries" },
  { label: "Cakes", slug: "cakes" },
] as const;

type MenuPageProps = {
  searchParams: Promise<{
    category?: string | string[];
  }>;
};

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const { category } = await searchParams;

  const categorySlug = typeof category === "string" ? category : undefined;

  const products = await getMenuProducts(categorySlug);

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden bg-foreground px-6 pb-20 pt-36 text-center text-surface sm:pb-24 sm:pt-40">
        <div
          aria-hidden="true"
          className="absolute -left-24 top-16 size-64 rounded-full bg-brand/35 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 bottom-0 size-72 rounded-full bg-brand-accent/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-3xl">
          <p className="font-navigation font-semibold text-brand-accent">
            Baked fresh every day
          </p>
          <h1 className="mt-3 font-display text-5xl font-semibold sm:text-6xl">
            Our Menu
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-surface/75 sm:text-lg">
            Discover handcrafted breads and pastries available for pickup or
            delivery across Accra.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="menu-products-heading"
        className="px-6 py-16 sm:py-20 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-navigation font-semibold text-brand">
                Choose your favourite
              </p>
              <h2
                id="menu-products-heading"
                className="mt-2 font-display text-4xl font-semibold text-foreground"
              >
                Fresh from the oven
              </h2>
            </div>

            <p className="text-sm text-bakery-muted" aria-live="polite">
              {products.length} {products.length === 1 ? "item" : "items"}
            </p>
          </div>

          <nav
            aria-label="Filter menu by category"
            className="mt-8 flex gap-3 overflow-x-auto pb-2"
          >
            {categories.map((item) => {
              const isActive = item.slug === categorySlug;
              const href = item.slug ? `/menu?category=${item.slug}` : "/menu";

              return (
                <Link
                  key={item.label}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`shrink-0 rounded-full border px-5 py-2.5 font-navigation text-sm font-semibold transition-colors ${
                    isActive
                      ? "border-brand bg-brand text-surface"
                      : "border-brand/20 bg-background text-foreground hover:border-brand hover:text-brand"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {products.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    category: product.category.name,
                    pricePesewas: product.pricePesewas,
                    imageUrl: product.imageUrl,
                    isAvailable: product.isAvailable,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-brand/15 bg-brand-accent/10 px-6 py-16 text-center">
              <h3 className="font-display text-3xl font-semibold text-foreground">
                Nothing is on this tray yet
              </h3>
              <p className="mx-auto mt-3 max-w-md text-bakery-muted">
                Try another category or view everything currently available from
                our bakery.
              </p>
              <Link
                href="/menu"
                className="mt-6 inline-flex rounded-lg bg-brand px-5 py-3 font-navigation text-sm font-semibold text-surface transition-colors hover:bg-brand/90"
              >
                View full menu
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
