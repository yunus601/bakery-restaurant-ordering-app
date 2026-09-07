import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { getAdminCategoryById } from "@/lib/queries/admin-categories";

type EditCategoryPageProps = {
  params: Promise<{ categoryId: string }>;
};

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { categoryId } = await params;
  const category = await getAdminCategoryById(categoryId);

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <Link
        href="/admin/categories"
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to categories
      </Link>

      <header className="mt-6">
        <p className="font-navigation text-sm font-semibold uppercase tracking-[0.18em] text-brand">
          Catalogue
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
          Edit category
        </h1>
        <p className="mt-3 text-sm text-bakery-muted">
          Update {category.name} and its storefront settings.
        </p>
      </header>

      <div className="mt-8">
        <CategoryForm
          key={`edit-category-${category.id}`}
          mode="edit"
          category={category}
        />
      </div>
    </div>
  );
}
