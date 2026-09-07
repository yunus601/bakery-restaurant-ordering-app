import { FolderOpen, Package, Pencil } from "lucide-react";
import Link from "next/link";

import type { AdminCategory } from "@/lib/queries/admin-categories";
import { cn } from "@/lib/utils";

export function CategoryList({ categories }: { categories: AdminCategory[] }) {
  if (categories.length === 0) {
    return (
      <div className="mt-6 grid min-h-80 place-items-center rounded-2xl border bg-white px-6 py-12 text-center shadow-sm">
        <div>
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand/10 text-brand">
            <FolderOpen className="size-6" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-navigation font-semibold">
            No categories yet
          </h2>
          <p className="mt-2 max-w-sm text-sm text-bakery-muted">
            Create a category before adding products to the menu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {categories.map((category) => (
        <article
          key={category.id}
          className="flex min-h-56 flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:border-brand/30 hover:shadow-md sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
              <FolderOpen className="size-5" aria-hidden="true" />
            </span>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-semibold",
                  category.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-stone-100 text-stone-700",
                )}
              >
                {category.isActive ? "Active" : "Inactive"}
              </span>
              <Link
                href={`/admin/categories/${category.id}/edit`}
                aria-label={`Edit ${category.name}`}
                title="Edit category"
                className="grid size-9 place-items-center rounded-lg border text-brand transition hover:border-brand hover:bg-brand/10"
              >
                <Pencil className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <h2 className="mt-5 font-navigation text-lg font-semibold">
            {category.name}
          </h2>
          <p className="mt-1 text-xs text-bakery-muted">/{category.slug}</p>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-bakery-muted">
            {category.description || "No category description."}
          </p>

          <div className="mt-auto flex items-center justify-between gap-4 border-t pt-4 text-sm">
            <span className="flex items-center gap-2 text-bakery-muted">
              <Package className="size-4" aria-hidden="true" />
              {category._count.products}{" "}
              {category._count.products === 1 ? "product" : "products"}
            </span>
            <span className="text-xs text-bakery-muted">
              Order {category.sortOrder}
            </span>
          </div>
        </article>
      ))}
    </section>
  );
}
