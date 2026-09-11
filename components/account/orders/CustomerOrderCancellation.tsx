"use client";

import { AlertTriangle, X } from "lucide-react";
import { useActionState, useState } from "react";

import {
  cancelCustomerOrderAction,
  type CancelCustomerOrderState,
} from "@/app/account/orders/actions";
import { Button } from "@/components/ui/button";

const initialState: CancelCustomerOrderState = { success: false };

export function CustomerOrderCancellation({ orderId }: { orderId: string }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [state, formAction, pending] = useActionState(
    cancelCustomerOrderAction,
    initialState,
  );

  if (state.success) {
    return (
      <div role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-800">
        {state.message}
      </div>
    );
  }

  if (!isConfirming) {
    return (
      <Button type="button" variant="destructive" onClick={() => setIsConfirming(true)}>
        <X aria-hidden="true" /> Cancel order
      </Button>
    );
  }

  return (
    <form action={formAction} className="rounded-xl border border-red-200 bg-red-50 p-4">
      <input type="hidden" name="orderId" value={orderId} />
      <p className="flex items-start gap-2 text-sm font-semibold text-red-900">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Cancel this order?
      </p>
      <p className="mt-2 text-xs leading-5 text-red-800">
        This cannot be undone. The bakery will stop preparing this order.
      </p>
      <label htmlFor="cancellationReason" className="mt-4 block text-sm font-medium text-red-950">
        Reason <span className="font-normal">(optional)</span>
      </label>
      <textarea
        id="cancellationReason"
        name="cancellationReason"
        rows={3}
        maxLength={500}
        className="mt-2 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
        aria-invalid={Boolean(state.errors?.cancellationReason)}
        aria-describedby={state.errors?.cancellationReason ? "cancellationReason-error" : undefined}
      />
      {state.errors?.cancellationReason?.[0] && (
        <p id="cancellationReason-error" className="mt-1 text-xs text-red-700">
          {state.errors.cancellationReason[0]}
        </p>
      )}
      {state.message && (
        <p role="alert" className="mt-3 text-sm text-red-800">{state.message}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="submit" variant="destructive" disabled={pending}>
          {pending ? "Cancelling..." : "Yes, cancel order"}
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={() => setIsConfirming(false)}>
          Keep order
        </Button>
      </div>
    </form>
  );
}
