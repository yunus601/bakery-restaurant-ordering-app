import { Plus } from "lucide-react";
import Link from "next/link";

import { CategoryList } from "@/components/admin/categories/CategoryList";
import { getAdminCategories } from "@/lib/queries/admin-categories";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-navigation text-sm font-semibold uppercase tracking-[0.18em] text-brand">
            Catalogue
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
            Categories
          </h1>
          <p className="mt-3 text-sm text-bakery-muted">
            Organize products into clear storefront menu sections.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-navigation text-sm font-semibold text-white transition hover:bg-brand/90"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add category
        </Link>
      </header>

      <div className="mt-8 flex items-center justify-between rounded-2xl border bg-white px-5 py-4 shadow-sm sm:px-6">
        <p className="text-sm text-bakery-muted">
          <span className="font-semibold text-foreground">
            {categories.length.toLocaleString("en-GH")}
          </span>{" "}
          {categories.length === 1 ? "category" : "categories"}
        </p>
        <p className="text-sm text-bakery-muted">
          {categories.filter((category) => category.isActive).length} active
        </p>
      </div>

      <CategoryList categories={categories} />
    </div>
  );
}
