import { CheckCircle2, PackageOpen, Pencil, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/formatters";
import type { AdminProduct } from "@/lib/queries/admin-product";
import { cn } from "@/lib/utils";
import { ArchiveProductButton } from "@/components/admin/products/ArchiveProductButton";
import { RestoreProductButton } from "@/components/admin/products/RestoreProductButton";

type ProductResultsProps = {
  products: AdminProduct[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
};

export function ProductResults({
  products,
  totalItems,
  currentPage,
  totalPages,
}: ProductResultsProps) {
  return (
    <section className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b px-5 py-4 sm:px-6">
        <p className="text-sm text-bakery-muted">
          <span className="font-semibold text-foreground">
            {totalItems.toLocaleString("en-GH")}
          </span>{" "}
          {totalItems === 1 ? "product" : "products"}
        </p>
        <p className="text-sm text-bakery-muted">
          Page {currentPage} of {Math.max(1, totalPages)}
        </p>
      </div>

      {products.length === 0 ? (
        <EmptyProducts />
      ) : (
        <>
          <ProductCards products={products} />
          <ProductTable products={products} />
        </>
      )}
    </section>
  );
}

function ProductCards({ products }: { products: AdminProduct[] }) {
  return (
    <ul className="divide-y md:hidden">
      {products.map((product) => (
        <li key={product.id} className="flex gap-4 p-5">
          <ProductImage imageUrl={product.imageUrl} name={product.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-navigation font-semibold">
              {product.name}
            </p>
            <p className="mt-1 text-sm text-bakery-muted">
              {product.category.name}
            </p>
            <p className="mt-2 font-semibold">
              {formatPrice(product.pricePesewas)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <AvailabilityBadge
                isAvailable={product.isAvailable}
                isArchived={Boolean(product.archivedAt)}
              />
              {product.isFeatured && <FeaturedBadge />}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              {product.archivedAt ? (
                <RestoreProductButton
                  productId={product.id}
                  productName={product.name}
                />
              ) : (
                <>
                  <EditProductLink productId={product.id} />
                  <ArchiveProductButton
                    productId={product.id}
                    productName={product.name}
                  />
                </>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ProductTable({ products }: { products: AdminProduct[] }) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-190 text-left text-sm">
        <thead className="bg-[#faf7f4] text-xs uppercase tracking-wide text-bakery-muted">
          <tr>
            <th className="px-5 py-3 font-semibold sm:px-6">Product</th>
            <th className="px-5 py-3 font-semibold">Category</th>
            <th className="px-5 py-3 font-semibold">Price</th>
            <th className="px-5 py-3 font-semibold">Availability</th>
            <th className="px-5 py-3 font-semibold sm:px-6">Featured</th>
            <th className="px-5 py-3 text-right font-semibold sm:px-6">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {products.map((product) => (
            <tr key={product.id} className="transition-colors hover:bg-brand/5">
              <td className="px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <ProductImage imageUrl={product.imageUrl} name={product.name} />
                  <div className="min-w-0">
                    <p className="font-navigation font-semibold">
                      {product.name}
                    </p>
                    <p className="mt-1 text-xs text-bakery-muted">
                      /{product.slug}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-bakery-muted">
                {product.category.name}
              </td>
              <td className="px-5 py-4 font-semibold">
                {formatPrice(product.pricePesewas)}
              </td>
              <td className="px-5 py-4">
                <AvailabilityBadge
                  isAvailable={product.isAvailable}
                  isArchived={Boolean(product.archivedAt)}
                />
              </td>
              <td className="px-5 py-4 sm:px-6">
                {product.isFeatured ? (
                  <FeaturedBadge />
                ) : (
                  <span className="text-bakery-muted">No</span>
                )}
              </td>
              <td className="px-5 py-4 text-right sm:px-6">
                <div className="flex justify-end gap-2">
                  {product.archivedAt ? (
                    <RestoreProductButton
                      productId={product.id}
                      productName={product.name}
                    />
                  ) : (
                    <>
                      <EditProductLink productId={product.id} />
                      <ArchiveProductButton
                        productId={product.id}
                        productName={product.name}
                      />
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductImage({ imageUrl, name }: { imageUrl: string; name: string }) {
  return (
    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[#faf7f4]">
      <Image
        src={imageUrl}
        alt={name}
        fill
        sizes="56px"
        className="object-contain p-1"
      />
    </div>
  );
}

function EditProductLink({ productId }: { productId: string }) {
  return (
    <Link
      href={`/admin/products/${productId}/edit`}
      aria-label="Edit product"
      title="Edit product"
      className="grid size-9 place-items-center rounded-lg border text-brand transition hover:border-brand hover:bg-brand/10"
    >
      <Pencil className="size-4" aria-hidden="true" />
    </Link>
  );
}

function AvailabilityBadge({
  isAvailable,
  isArchived,
}: {
  isAvailable: boolean;
  isArchived: boolean;
}) {
  if (isArchived) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
        <PackageOpen className="size-3.5" aria-hidden="true" />
        Archived
      </span>
    );
  }

  const Icon = isAvailable ? CheckCircle2 : XCircle;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        isAvailable
          ? "bg-green-100 text-green-800"
          : "bg-stone-100 text-stone-700",
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {isAvailable ? "Available" : "Unavailable"}
    </span>
  );
}

function FeaturedBadge() {
  return (
    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
      Featured
    </span>
  );
}

function EmptyProducts() {
  return (
    <div className="grid min-h-80 place-items-center px-6 py-12 text-center">
      <div>
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand/10 text-brand">
          <PackageOpen className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-navigation font-semibold">
          No matching products
        </h2>
        <p className="mt-2 max-w-sm text-sm text-bakery-muted">
          Try changing or resetting the current filters.
        </p>
      </div>
    </div>
  );
}
