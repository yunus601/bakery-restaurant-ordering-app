"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";

import {
  cleanupProductImageAction,
  createProductAction,
  type ProductActionState,
  updateProductAction,
} from "@/app/admin/products/action";
import { Button } from "@/components/ui/button";
import type {
  AdminProductCategory,
  AdminProductDetails,
} from "@/lib/queries/admin-product";
import type { ProductInput } from "@/lib/validation/product";
import { cn } from "@/lib/utils";
import { ProductImageUpload } from "./ProductImageUpload";

const initialState: ProductActionState = { success: false };

type ProductFormProps =
  | {
      mode: "create";
      categories: AdminProductCategory[];
      product?: never;
    }
  | {
      mode: "edit";
      categories: AdminProductCategory[];
      product: AdminProductDetails;
    };

export function ProductForm({
  mode,
  categories,
  product,
}: ProductFormProps) {
  const isEditing = mode === "edit";
  const router = useRouter();
  const persistedImagePublicId = product?.imagePublicId ?? "";
  const [currentImagePublicId, setCurrentImagePublicId] = useState(
    persistedImagePublicId,
  );
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string>();
  const [state, formAction, pending] = useActionState(
    isEditing ? updateProductAction : createProductAction,
    initialState,
  );

  async function cancelForm() {
    setCancelling(true);
    setCancelError(undefined);

    const hasTemporaryImage =
      currentImagePublicId &&
      currentImagePublicId !== persistedImagePublicId;

    if (hasTemporaryImage) {
      const result = await cleanupProductImageAction(currentImagePublicId);

      if (!result.success) {
        setCancelError(
          result.message ?? "The temporary image could not be removed.",
        );
        setCancelling(false);
        return;
      }
    }

    router.push("/admin/products");
  }

  if (state.success) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-green-100 text-green-700">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-navigation text-xl font-semibold">
          Product {isEditing ? "updated" : "created"}
        </h2>
        <p className="mt-2 text-sm text-bakery-muted">{state.message}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/admin/products"
            className="grid h-11 place-items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand/90"
          >
            View products
          </Link>
          {!isEditing && (
            <Link
              href="/admin/products/new"
              className="grid h-11 place-items-center rounded-xl border px-5 text-sm font-semibold transition hover:border-brand hover:text-brand"
            >
              Add another
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {product && <input type="hidden" name="productId" value={product.id} />}
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-navigation text-lg font-semibold">
          Product details
        </h2>
        <p className="mt-1 text-sm text-bakery-muted">
          The information customers will see on the storefront.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field
            label="Product name"
            name="name"
            defaultValue={product?.name}
            error={firstError(state.errors?.name)}
            className="sm:col-span-2"
          />
          <Field
            label="Price (GHS)"
            name="priceGhs"
            inputMode="decimal"
            placeholder="25.50"
            defaultValue={
              product ? formatPesewasForInput(product.pricePesewas) : undefined
            }
            error={firstError(state.errors?.priceGhs)}
          />
          <SelectField
            label="Category"
            name="categoryId"
            error={firstError(state.errors?.categoryId)}
            defaultValue={product?.categoryId ?? ""}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </SelectField>
          <ProductImageUpload
            defaultImageUrl={product?.imageUrl}
            defaultImagePublicId={product?.imagePublicId}
            onPublicIdChange={setCurrentImagePublicId}
            error={firstError(state.errors?.imageUrl)}
          />
          <label className="sm:col-span-2">
            <span className="text-sm font-medium">Description</span>
            <textarea
              name="description"
              rows={5}
              maxLength={500}
              defaultValue={product?.description ?? ""}
              aria-invalid={Boolean(state.errors?.description)}
              aria-describedby={
                state.errors?.description ? "description-error" : undefined
              }
              className={inputClasses(Boolean(state.errors?.description))}
            />
            <FieldError
              id="description-error"
              message={firstError(state.errors?.description)}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-navigation text-lg font-semibold">
          Catalogue settings
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field
            label="Sort order"
            name="sortOrder"
            type="number"
            min={0}
            step={1}
            defaultValue={String(product?.sortOrder ?? 0)}
            error={firstError(state.errors?.sortOrder)}
          />
          <div className="space-y-3 sm:self-end sm:pb-2">
            <CheckboxField
              name="isAvailable"
              label="Available for ordering"
              defaultChecked={product?.isAvailable ?? true}
            />
            <CheckboxField
              name="isFeatured"
              label="Feature on homepage"
              defaultChecked={product?.isFeatured ?? false}
            />
          </div>
        </div>
      </section>

      {state.message && (
        <p
          aria-live="polite"
          className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {state.message}
        </p>
      )}
      {cancelError && (
        <p
          aria-live="polite"
          className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {cancelError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={pending || cancelling}
          onClick={() => void cancelForm()}
          className="h-11 cursor-pointer px-5 font-semibold hover:border-brand hover:text-brand"
        >
          {cancelling ? "Cancelling…" : "Cancel"}
        </Button>
        <Button
          type="submit"
          disabled={pending || cancelling || categories.length === 0}
          className="h-11 bg-brand px-6 font-navigation text-white hover:bg-brand/90"
        >
          {pending
            ? isEditing
              ? "Saving…"
              : "Creating…"
            : isEditing
              ? "Save changes"
              : "Create product"}
        </Button>
      </div>
    </form>
  );
}

type FieldProps = React.ComponentProps<"input"> & {
  label: string;
  name: keyof ProductInput;
  error?: string;
};

function Field({ label, name, error, className, ...props }: FieldProps) {
  const errorId = `${name}-error`;

  return (
    <label className={className}>
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={inputClasses(Boolean(error))}
        {...props}
      />
      <FieldError id={errorId} message={error} />
    </label>
  );
}

function SelectField({
  label,
  name,
  error,
  children,
  defaultValue,
}: {
  label: string;
  name: keyof ProductInput;
  error?: string;
  children: React.ReactNode;
  defaultValue: string;
}) {
  const errorId = `${name}-error`;

  return (
    <label>
      <span className="text-sm font-medium">{label}</span>
      <select
        name={name}
        required
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(inputClasses(Boolean(error)), "cursor-pointer")}
      >
        {children}
      </select>
      <FieldError id={errorId} message={error} />
    </label>
  );
}

function CheckboxField({
  name,
  label,
  defaultChecked = false,
}: {
  name: "isAvailable" | "isFeatured";
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 cursor-pointer accent-brand"
      />
      {label}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <span id={id} className="mt-1 block text-sm text-red-700">
      {message}
    </span>
  );
}

function firstError(errors?: string[]) {
  return errors?.[0];
}

function inputClasses(hasError: boolean) {
  return cn(
    "mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15",
    hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/15",
  );
}

function formatPesewasForInput(pricePesewas: number) {
  return (pricePesewas / 100).toFixed(2);
}
