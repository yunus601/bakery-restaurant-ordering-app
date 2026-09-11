"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import {
  createDeliveryZoneAction,
  type DeliveryZoneActionState,
  updateDeliveryZoneAction,
} from "@/app/admin/delivery-zones/actions";
import { Button } from "@/components/ui/button";
import type { AdminDeliveryZone } from "@/lib/queries/delivery-zones";
import { cn } from "@/lib/utils";

const initialState: DeliveryZoneActionState = { success: false };

type Props =
  | { mode: "create"; zone?: never; defaultFeePesewas: number }
  | { mode: "edit"; zone: AdminDeliveryZone; defaultFeePesewas: number };

export function DeliveryZoneForm({ mode, zone, defaultFeePesewas }: Props) {
  const isEditing = mode === "edit";
  const [state, formAction, pending] = useActionState(
    isEditing ? updateDeliveryZoneAction : createDeliveryZoneAction,
    initialState,
  );

  if (state.success) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto size-12 text-green-700" aria-hidden="true" />
        <h2 className="mt-4 font-navigation text-xl font-semibold">{state.message}</h2>
        <Link href="/admin/delivery-zones" className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white">
          View delivery zones
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {zone && <input type="hidden" name="zoneId" value={zone.id} />}
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Zone name" name="name" defaultValue={zone?.name} error={state.errors?.name?.[0]} className="sm:col-span-2" />
          <Field label="Delivery fee (GHS)" name="deliveryFeeGhs" type="number" min="0" step="0.01" defaultValue={((zone?.deliveryFeePesewas ?? defaultFeePesewas) / 100).toFixed(2)} error={state.errors?.deliveryFeePesewas?.[0]} />
          <Field label="Minimum order (GHS, optional)" name="minimumOrderGhs" type="number" min="0" step="0.01" defaultValue={zone?.minimumOrderPesewas == null ? "" : (zone.minimumOrderPesewas / 100).toFixed(2)} error={state.errors?.minimumOrderPesewas?.[0]} />
          <Field label="Sort order" name="sortOrder" type="number" min="0" step="1" defaultValue={zone?.sortOrder ?? 0} error={state.errors?.sortOrder?.[0]} />
          <label className="flex cursor-pointer items-center gap-3 self-end pb-3 text-sm font-medium">
            <input type="checkbox" name="isActive" defaultChecked={zone?.isActive ?? true} className="size-4 accent-brand" />
            Available at checkout
          </label>
        </div>
      </section>

      {state.message && <p aria-live="polite" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.message}</p>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/admin/delivery-zones" className="grid h-11 place-items-center rounded-xl border px-5 text-sm font-semibold">Cancel</Link>
        <Button type="submit" disabled={pending} className="h-11 bg-brand px-6 font-navigation text-white hover:bg-brand/90">
          {pending ? "Saving…" : isEditing ? "Save changes" : "Create zone"}
        </Button>
      </div>
    </form>
  );
}

type FieldProps = React.ComponentProps<"input"> & { label: string; error?: string };

function Field({ label, error, className, ...props }: FieldProps) {
  return (
    <label className={className}>
      <span className="text-sm font-medium">{label}</span>
      <input required={props.name !== "minimumOrderGhs"} aria-invalid={Boolean(error)} className={cn("mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15", error && "border-red-500")} {...props} />
      {error && <span className="mt-1 block text-sm text-red-700">{error}</span>}
    </label>
  );
}
