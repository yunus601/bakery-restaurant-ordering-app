"use client";

import { RotateCcw } from "lucide-react";
import { useActionState } from "react";

import {
  restoreProductAction,
  type ArchiveProductState,
} from "@/app/admin/products/action";

const initialState: ArchiveProductState = { success: false };

export function RestoreProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [state, formAction, pending] = useActionState(
    restoreProductAction,
    initialState,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="productId" value={productId} />
      <button
        type="submit"
        disabled={pending}
        aria-label={`Restore ${productName}`}
        title="Restore product"
        className="grid size-9 cursor-pointer place-items-center rounded-lg border text-green-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RotateCcw
          className={pending ? "size-4 animate-spin" : "size-4"}
          aria-hidden="true"
        />
      </button>
      {state.message && !state.success && (
        <span className="sr-only" aria-live="polite">
          {state.message}
        </span>
      )}
    </form>
  );
}
