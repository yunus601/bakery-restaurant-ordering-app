"use client";

import { useActionState } from "react";

import {
  updateOrderStatusAction,
  type UpdateOrderStatusState,
} from "@/app/admin/orders/actions";
import { Button } from "@/components/ui/button";
import type {
  OrderStatus,
  PaymentStatus,
} from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

const initialState: UpdateOrderStatusState = { success: false };

type OrderStatusControlProps = {
  orderId: string;
  currentStatus: OrderStatus;
  allowedStatuses: OrderStatus[];
  paymentStatus: PaymentStatus;
};

export function OrderStatusControl({
  orderId,
  currentStatus,
  allowedStatuses,
  paymentStatus,
}: OrderStatusControlProps) {
  const [state, formAction, pending] = useActionState(
    updateOrderStatusAction,
    initialState,
  );
  const completionLocked =
    allowedStatuses.includes("COMPLETED") && paymentStatus !== "PAID";

  if (allowedStatuses.length === 0) {
    return (
      <p className="text-sm leading-6 text-bakery-muted">
        {currentStatus === "COMPLETED"
          ? "This order is complete and cannot be changed."
          : "This order was cancelled and cannot be changed."}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />

      <label className="block text-sm font-medium" htmlFor="nextStatus">
        Move order to
      </label>
      <select
        key={`${currentStatus}-${allowedStatuses.join("-")}`}
        id="nextStatus"
        name="nextStatus"
        required
        defaultValue=""
        disabled={pending}
        className="h-11 w-full cursor-pointer rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="" disabled>
          Select the next status
        </option>
        {allowedStatuses.map((status) => (
          <option
            key={status}
            value={status}
            disabled={status === "COMPLETED" && completionLocked}
          >
            {formatStatus(status)}
            {status === "COMPLETED" && completionLocked
              ? " — payment required"
              : ""}
          </option>
        ))}
      </select>

      {completionLocked && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm leading-5 text-amber-800">
          Mark the payment as paid before completing this order.
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full bg-brand font-navigation text-white hover:bg-brand/90"
      >
        {pending ? "Updating…" : "Update status"}
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

function formatStatus(status: OrderStatus) {
  return status.toLowerCase().replaceAll("_", " ");
}
