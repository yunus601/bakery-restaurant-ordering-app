"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import {
  createCategoryAction,
  type CategoryActionState,
  updateCategoryAction,
} from "@/app/admin/categories/action";
import { Button } from "@/components/ui/button";
import type { AdminCategoryDetails } from "@/lib/queries/admin-categories";
import type { CategoryInput } from "@/lib/validation/category";
import { cn } from "@/lib/utils";

const initialState: CategoryActionState = { success: false };

type CategoryFormProps =
  | { mode: "create"; category?: never }
  | { mode: "edit"; category: AdminCategoryDetails };

export function CategoryForm({ mode, category }: CategoryFormProps) {
  const isEditing = mode === "edit";
  const [state, formAction, pending] = useActionState(
    isEditing ? updateCategoryAction : createCategoryAction,
    initialState,
  );

  if (state.success) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-green-100 text-green-700">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-navigation text-xl font-semibold">
          Category {isEditing ? "updated" : "created"}
        </h2>
        <p className="mt-2 text-sm text-bakery-muted">{state.message}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/admin/categories"
            className="grid h-11 place-items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand/90"
          >
            View categories
          </Link>
          {!isEditing && (
            <Link
              href="/admin/categories/new"
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
      {category && (
        <input type="hidden" name="categoryId" value={category.id} />
      )}
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-navigation text-lg font-semibold">
          Category details
        </h2>
        <p className="mt-1 text-sm text-bakery-muted">
          Categories organize products into sections on the menu.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field
            label="Category name"
            name="name"
            defaultValue={category?.name}
            error={firstError(state.errors?.name)}
            className="sm:col-span-2"
          />

          <label className="sm:col-span-2">
            <span className="text-sm font-medium">Description</span>
            <textarea
              name="description"
              rows={5}
              maxLength={300}
              defaultValue={category?.description ?? ""}
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

          <Field
            label="Sort order"
            name="sortOrder"
            type="number"
            min={0}
            step={1}
            defaultValue={String(category?.sortOrder ?? 0)}
            error={firstError(state.errors?.sortOrder)}
          />

          <label className="flex cursor-pointer items-center gap-3 self-end pb-3 text-sm font-medium">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={category?.isActive ?? true}
              className="size-4 cursor-pointer accent-brand"
            />
            Active on the storefront
          </label>
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

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/categories"
          className="grid h-11 place-items-center rounded-xl border px-5 text-sm font-semibold transition hover:border-brand hover:text-brand"
        >
          Cancel
        </Link>
        <Button
          type="submit"
          disabled={pending}
          className="h-11 bg-brand px-6 font-navigation text-white hover:bg-brand/90"
        >
          {pending
            ? isEditing
              ? "Saving…"
              : "Creating…"
            : isEditing
              ? "Save changes"
              : "Create category"}
        </Button>
      </div>
    </form>
  );
}

type FieldProps = React.ComponentProps<"input"> & {
  label: string;
  name: keyof CategoryInput;
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
