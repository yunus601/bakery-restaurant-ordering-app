import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/products/ProductForm";
import {
  getAdminProductById,
  getAdminProductCategories,
} from "@/lib/queries/admin-product";

type EditProductPageProps = {
  params: Promise<{ productId: string }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { productId } = await params;
  const product = await getAdminProductById(productId);

  if (!product) notFound();

  const categories = await getAdminProductCategories();

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to products
      </Link>

      <header className="mt-6">
        <p className="font-navigation text-sm font-semibold uppercase tracking-[0.18em] text-brand">
          Catalogue
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
          Edit product
        </h1>
        <p className="mt-3 text-sm text-bakery-muted">
          Update {product.name} and its storefront settings.
        </p>
      </header>

      <div className="mt-8">
        <ProductForm
          key={`edit-product-${product.id}`}
          mode="edit"
          categories={categories}
          product={product}
        />
      </div>
    </div>
  );
}
