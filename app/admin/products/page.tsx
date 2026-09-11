import { Plus } from "lucide-react";
import Link from "next/link";

import { ProductFilters } from "@/components/admin/products/ProductFilters";
import { ProductPagination } from "@/components/admin/products/ProductPagination";
import { ProductResults } from "@/components/admin/products/ProductResults";
import type {
  AvailabilityFilter,
  ProductVisibilityFilter,
} from "@/lib/queries/admin-product";
import {
  getAdminProductCategories,
  getAdminProducts,
} from "@/lib/queries/admin-product";

const availabilityValues = ["all", "available", "unavailable"] as const;
const visibilityValues = ["active", "archived"] as const;

type ProductsPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    q?: string | string[];
    category?: string | string[];
    availability?: string | string[];
    visibility?: string | string[];
  }>;
};

export default async function AdminProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const page = firstValue(params.page) ?? "1";
  const search = firstValue(params.q)?.slice(0, 100);
  const categoryId = firstValue(params.category);
  const visibility = parseVisibility(firstValue(params.visibility));
  const availability =
    visibility === "archived"
      ? "all"
      : parseAvailability(firstValue(params.availability));

  const result = await getAdminProducts({
    page,
    search,
    categoryId,
    availability,
    visibility,
  });
  const categories = await getAdminProductCategories();

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-navigation text-sm font-semibold uppercase tracking-[0.18em] text-brand">
            Catalogue
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
            Products
          </h1>
          <p className="mt-3 text-sm text-bakery-muted">
            Review your menu, pricing, availability, and featured products.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-navigation text-sm font-semibold text-white transition hover:bg-brand/90"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add product
        </Link>
      </header>

      <ProductFilters
        key={[search, categoryId, availability, visibility].join(":")}
        search={search}
        categoryId={categoryId}
        availability={availability}
        visibility={visibility}
        categories={categories}
      />

      <ProductResults
        products={result.products}
        totalItems={result.pagination.totalItems}
        currentPage={result.pagination.page}
        totalPages={result.pagination.totalPages}
      />

      <ProductPagination
        currentPage={result.pagination.page}
        totalPages={result.pagination.totalPages}
        search={search}
        categoryId={categoryId}
        availability={availability}
        visibility={visibility}
      />
    </div>
  );
}

function parseAvailability(value?: string): AvailabilityFilter {
  return availabilityValues.includes(value as AvailabilityFilter)
    ? (value as AvailabilityFilter)
    : "all";
}

function parseVisibility(value?: string): ProductVisibilityFilter {
  return visibilityValues.includes(value as ProductVisibilityFilter)
    ? (value as ProductVisibilityFilter)
    : "active";
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
