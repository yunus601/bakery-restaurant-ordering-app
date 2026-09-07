"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Archive } from "lucide-react";
import { useActionState, useState } from "react";

import {
  archiveProductAction,
  type ArchiveProductState,
} from "@/app/admin/products/action";
import { Button } from "@/components/ui/button";

const initialState: ArchiveProductState = { success: false };

export function ArchiveProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    archiveProductAction,
    initialState,
  );

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger
        aria-label={`Archive ${productName}`}
        title="Archive product"
        className="grid size-9 cursor-pointer place-items-center rounded-lg border text-red-700 transition hover:border-red-300 hover:bg-red-50"
      >
        <Archive className="size-4" aria-hidden="true" />
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-black/30 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
        <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-6 shadow-xl transition-[scale,opacity] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <AlertDialog.Title className="font-navigation text-xl font-semibold">
            Archive {productName}?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-6 text-bakery-muted">
            This removes the product from the storefront and marks it
            unavailable. Existing order history will remain unchanged.
          </AlertDialog.Description>

          <form action={formAction} className="mt-6">
            <input type="hidden" name="productId" value={productId} />

            {state.message && !state.success && (
              <p
                aria-live="polite"
                className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
              >
                {state.message}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <AlertDialog.Close
                type="button"
                disabled={pending}
                className="h-10 cursor-pointer rounded-xl border px-4 text-sm font-semibold transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </AlertDialog.Close>
              <Button
                type="submit"
                disabled={pending}
                className="h-10 bg-red-700 px-4 text-white hover:bg-red-800"
              >
                {pending ? "Archiving…" : "Archive product"}
              </Button>
            </div>
          </form>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
