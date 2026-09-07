"use client";

import { useActionState } from "react";

import {
  updatePaymentStatusAction,
  type UpdatePaymentStatusState,
} from "@/app/admin/orders/actions";
import { Button } from "@/components/ui/button";
import type { PaymentStatus } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

const initialState: UpdatePaymentStatusState = { success: false };

type PaymentStatusControlProps = {
  orderId: string;
  currentStatus: PaymentStatus;
  allowedStatuses: PaymentStatus[];
  isOrderCancelled: boolean;
};

export function PaymentStatusControl({
  orderId,
  currentStatus,
  allowedStatuses,
  isOrderCancelled,
}: PaymentStatusControlProps) {
  const [state, formAction, pending] = useActionState(
    updatePaymentStatusAction,
    initialState,
  );

  if (allowedStatuses.length === 0) {
    return (
      <p className="text-sm leading-6 text-bakery-muted">
        {isOrderCancelled && currentStatus !== "PAID"
          ? "Payment cannot be collected for a cancelled order."
          : "No further payment changes are available."}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <label className="block text-sm font-medium" htmlFor="nextPaymentStatus">
        Change payment to
      </label>
      <select
        key={`${currentStatus}-${allowedStatuses.join("-")}`}
        id="nextPaymentStatus"
        name="nextStatus"
        required
        defaultValue={allowedStatuses[0]}
        disabled={pending}
        className="h-11 w-full cursor-pointer rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {allowedStatuses.map((status) => (
          <option key={status} value={status}>
            {formatStatus(status)}
          </option>
        ))}
      </select>
      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full bg-brand font-navigation text-white hover:bg-brand/90"
      >
        {pending ? "Updating…" : "Update payment"}
      </Button>
      {state.message && (
        <p
          aria-live="polite"
          className={cn(
            "rounded-xl p-3 text-sm",
            state.success
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-700",
          )}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

function formatStatus(status: PaymentStatus) {
  return status.toLowerCase().replaceAll("_", " ");
}
