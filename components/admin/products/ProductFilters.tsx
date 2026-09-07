"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

import type {
  AdminProductCategory,
  AvailabilityFilter,
  ProductVisibilityFilter,
} from "@/lib/queries/admin-product";

type ProductFiltersProps = {
  search?: string;
  categoryId?: string;
  availability: AvailabilityFilter;
  visibility: ProductVisibilityFilter;
  categories: AdminProductCategory[];
};

export function ProductFilters({
  search,
  categoryId,
  availability,
  visibility,
  categories,
}: ProductFiltersProps) {
  const hasFilters = Boolean(
    search ||
      categoryId ||
      availability !== "all" ||
      visibility !== "active",
  );

  return (
    <form
      action="/admin/products"
      className="mt-8 grid gap-3 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_14rem_12rem_11rem_auto]"
    >
      <label className="relative md:col-span-2 xl:col-span-1">
        <span className="sr-only">Search products</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-bakery-muted"
          aria-hidden="true"
        />
        <input
          name="q"
          type="search"
          defaultValue={search}
          placeholder="Search product name"
          className="h-11 w-full rounded-xl border bg-background pl-10 pr-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
        />
      </label>

      <label className="relative">
        <span className="sr-only">Filter by category</span>
        <SlidersHorizontal
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-bakery-muted"
          aria-hidden="true"
        />
        <select
          name="category"
          defaultValue={categoryId ?? ""}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="h-11 w-full cursor-pointer appearance-none rounded-xl border bg-background pl-10 pr-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="sr-only">Filter by availability</span>
        <select
          name="availability"
          defaultValue={availability}
          disabled={visibility === "archived"}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="h-11 w-full cursor-pointer appearance-none rounded-xl border bg-background px-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="all">All availability</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </label>

      <label>
        <span className="sr-only">Show active or archived products</span>
        <select
          name="visibility"
          defaultValue={visibility}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="h-11 w-full cursor-pointer appearance-none rounded-xl border bg-background px-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
        >
          <option value="active">Active products</option>
          <option value="archived">Archived products</option>
        </select>
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          className="h-11 flex-1 cursor-pointer rounded-xl bg-brand px-5 font-navigation text-sm font-semibold text-white transition hover:bg-brand/90"
        >
          Apply
        </button>
        {hasFilters && (
          <Link
            href="/admin/products"
            className="grid h-11 place-items-center rounded-xl border px-4 text-sm font-semibold text-bakery-muted transition hover:border-brand hover:text-brand"
          >
            Reset
          </Link>
        )}
      </div>
    </form>
  );
}
